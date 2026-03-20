-- ============================================================
-- AUTOMATED WORKFLOW ENGINE -- Database Migration (safe re-run)
-- Run in: Supabase SQL Editor
-- ============================================================

-- 0. Notifications table -- skip if already exists
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL DEFAULT 'info',
  channel TEXT DEFAULT 'in_app',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source_type TEXT,
  source_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- 1. Workflow Rules
CREATE TABLE IF NOT EXISTS workflow_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL,
  condition JSONB DEFAULT '{}',
  action TEXT NOT NULL,
  action_params JSONB DEFAULT '{}',
  target TEXT,
  delay_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage workflow rules" ON workflow_rules;
CREATE POLICY "Admins can manage workflow rules"
  ON workflow_rules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','staff')
  ));

-- 2. Workflow Logs
CREATE TABLE IF NOT EXISTS workflow_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES workflow_rules(id),
  rule_name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  case_type TEXT NOT NULL,
  case_id UUID NOT NULL,
  case_reference TEXT,
  action_taken TEXT NOT NULL,
  action_result TEXT DEFAULT 'success',
  details JSONB DEFAULT '{}',
  executed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view workflow logs" ON workflow_logs;
DROP POLICY IF EXISTS "System can insert workflow logs" ON workflow_logs;

CREATE POLICY "Admins can view workflow logs"
  ON workflow_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','staff')
  ));

CREATE POLICY "System can insert workflow logs"
  ON workflow_logs FOR INSERT WITH CHECK (true);

-- 3. Generated Reports
CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL DEFAULT 'weekly',
  title TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  generated_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view reports" ON generated_reports;
DROP POLICY IF EXISTS "System can insert reports" ON generated_reports;

CREATE POLICY "Admins can view reports"
  ON generated_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','staff')
  ));

CREATE POLICY "System can insert reports"
  ON generated_reports FOR INSERT WITH CHECK (true);

-- 4. Reference Number Sequences
CREATE SEQUENCE IF NOT EXISTS complaint_ref_seq START 1;
CREATE SEQUENCE IF NOT EXISTS licence_ref_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cyber_ref_seq START 1;

-- 5. Auto-Acknowledge Function
CREATE OR REPLACE FUNCTION generate_reference_number(case_type TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  seq_val INTEGER;
BEGIN
  CASE case_type
    WHEN 'complaint' THEN
      prefix := 'CMP';
      seq_val := nextval('complaint_ref_seq');
    WHEN 'licence' THEN
      prefix := 'LIC';
      seq_val := nextval('licence_ref_seq');
    WHEN 'cyber' THEN
      prefix := 'CYB';
      seq_val := nextval('cyber_ref_seq');
    ELSE
      prefix := 'REF';
      seq_val := nextval('complaint_ref_seq');
  END CASE;
  RETURN 'BOCRA/' || prefix || '/' || EXTRACT(YEAR FROM now())::TEXT || '/' || LPAD(seq_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger: Auto-set reference number on new complaint
CREATE OR REPLACE FUNCTION set_complaint_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_reference_number('complaint');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_complaint_reference ON complaints;
CREATE TRIGGER trg_complaint_reference
  BEFORE INSERT ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION set_complaint_reference();

-- 7. Trigger: Auto-set reference number on new cyber incident
CREATE OR REPLACE FUNCTION set_cyber_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_reference_number('cyber');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cyber_reference ON cyber_incidents;
CREATE TRIGGER trg_cyber_reference
  BEFORE INSERT ON cyber_incidents
  FOR EACH ROW
  EXECUTE FUNCTION set_cyber_reference();

-- 8. COMPLETE check_escalations()
CREATE OR REPLACE FUNCTION check_escalations()
RETURNS JSONB AS $$
DECLARE
  rule RECORD;
  stale_case RECORD;
  escalation_count INTEGER := 0;
  new_priority TEXT;
BEGIN

  -- COMPLAINTS
  FOR rule IN
    SELECT * FROM workflow_rules
    WHERE is_active = true
      AND trigger_event = 'complaint.idle'
      AND action = 'escalate_priority'
  LOOP
    FOR stale_case IN
      SELECT id, reference_number, status, updated_at
      FROM complaints
      WHERE status NOT IN ('resolved', 'closed', 'escalated')
        AND updated_at < now() - (rule.delay_minutes || ' minutes')::INTERVAL
    LOOP
      UPDATE complaints
        SET status = 'escalated',
            updated_at = now()
        WHERE id = stale_case.id;

      INSERT INTO workflow_logs
        (rule_id, rule_name, trigger_event, case_type, case_id, case_reference, action_taken, details)
      VALUES
        (rule.id, rule.name, rule.trigger_event, 'complaint', stale_case.id, stale_case.reference_number,
         'escalate_priority',
         jsonb_build_object(
           'previous_status', stale_case.status,
           'new_status', 'escalated',
           'idle_since', stale_case.updated_at,
           'idle_minutes', EXTRACT(EPOCH FROM (now() - stale_case.updated_at)) / 60
         ));

      INSERT INTO notifications (user_id, type, channel, title, message, source_type, source_id, read)
      SELECT
        p.id,
        'escalation',
        'in_app',
        'Case escalated: ' || COALESCE(stale_case.reference_number, stale_case.id::TEXT),
        'Complaint ' || COALESCE(stale_case.reference_number, '') || ' has been idle for '
          || ROUND(EXTRACT(EPOCH FROM (now() - stale_case.updated_at)) / 86400)
          || ' days and was auto-escalated.',
        'complaint',
        stale_case.id,
        false
      FROM profiles p
      WHERE p.role IN ('admin', 'staff');

      escalation_count := escalation_count + 1;
    END LOOP;
  END LOOP;

  -- CYBER INCIDENTS
  FOR rule IN
    SELECT * FROM workflow_rules
    WHERE is_active = true
      AND trigger_event = 'incident.idle'
      AND action = 'escalate_priority'
  LOOP
    FOR stale_case IN
      SELECT id, reference_number, status, urgency, updated_at
      FROM cyber_incidents
      WHERE status NOT IN ('resolved', 'closed')
        AND updated_at < now() - (rule.delay_minutes || ' minutes')::INTERVAL
    LOOP
      new_priority := CASE stale_case.urgency
        WHEN 'low' THEN 'medium'
        WHEN 'medium' THEN 'high'
        WHEN 'high' THEN 'critical'
        ELSE 'critical'
      END;

      UPDATE cyber_incidents
        SET urgency = new_priority,
            updated_at = now()
        WHERE id = stale_case.id;

      INSERT INTO workflow_logs
        (rule_id, rule_name, trigger_event, case_type, case_id, case_reference, action_taken, details)
      VALUES
        (rule.id, rule.name, rule.trigger_event, 'cyber_incident', stale_case.id, stale_case.reference_number,
         'escalate_priority',
         jsonb_build_object(
           'previous_urgency', stale_case.urgency,
           'new_urgency', new_priority,
           'idle_since', stale_case.updated_at
         ));

      INSERT INTO notifications (user_id, type, channel, title, message, source_type, source_id, read)
      SELECT
        p.id,
        'escalation',
        'in_app',
        'Incident escalated: ' || COALESCE(stale_case.reference_number, stale_case.id::TEXT),
        'Cyber incident ' || COALESCE(stale_case.reference_number, '') || ' escalated from '
          || stale_case.urgency || ' to ' || new_priority || '.',
        'cyber_incident',
        stale_case.id,
        false
      FROM profiles p
      WHERE p.role IN ('admin', 'staff');

      escalation_count := escalation_count + 1;
    END LOOP;
  END LOOP;

  -- LICENCE APPLICATIONS
  FOR rule IN
    SELECT * FROM workflow_rules
    WHERE is_active = true
      AND trigger_event = 'application.idle'
      AND action = 'escalate_priority'
  LOOP
    FOR stale_case IN
      SELECT id, reference_number, status, updated_at
      FROM licence_applications
      WHERE status NOT IN ('approved', 'rejected')
        AND updated_at < now() - (rule.delay_minutes || ' minutes')::INTERVAL
    LOOP
      UPDATE licence_applications
        SET status = 'under_review',
            updated_at = now()
        WHERE id = stale_case.id
          AND status = 'pending';

      INSERT INTO workflow_logs
        (rule_id, rule_name, trigger_event, case_type, case_id, case_reference, action_taken, details)
      VALUES
        (rule.id, rule.name, rule.trigger_event, 'licence_application', stale_case.id, stale_case.reference_number,
         'escalate_priority',
         jsonb_build_object('previous_status', stale_case.status, 'idle_since', stale_case.updated_at));

      INSERT INTO notifications (user_id, type, channel, title, message, source_type, source_id, read)
      SELECT
        p.id,
        'escalation',
        'in_app',
        'Application stale: ' || COALESCE(stale_case.reference_number, stale_case.id::TEXT),
        'Licence application ' || COALESCE(stale_case.reference_number, '') || ' has been pending for over '
          || ROUND(EXTRACT(EPOCH FROM (now() - stale_case.updated_at)) / 86400)
          || ' days.',
        'licence_application',
        stale_case.id,
        false
      FROM profiles p
      WHERE p.role IN ('admin', 'staff');

      escalation_count := escalation_count + 1;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('escalations', escalation_count, 'checked_at', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Seed Default Rules (skip if already seeded)
INSERT INTO workflow_rules (name, description, trigger_event, condition, action, action_params, delay_minutes)
SELECT * FROM (VALUES
  ('Escalate stale complaints', 'Auto-escalate complaints untouched for 3 days', 'complaint.idle', '{"status_not_in": ["resolved","closed"]}'::JSONB, 'escalate_priority', '{"notify_supervisor": true}'::JSONB, 4320),
  ('Escalate critical incidents', 'Auto-escalate critical cyber incidents untouched for 24 hours', 'incident.idle', '{"urgency": "critical", "status_not_in": ["resolved","closed"]}'::JSONB, 'escalate_priority', '{"notify_supervisor": true}'::JSONB, 1440),
  ('Escalate stale applications', 'Auto-escalate licence applications untouched for 5 days', 'application.idle', '{"status_not_in": ["approved","rejected"]}'::JSONB, 'escalate_priority', '{"notify_supervisor": true}'::JSONB, 7200),
  ('Auto-acknowledge complaint', 'Send immediate confirmation on new complaint', 'complaint.created', '{}'::JSONB, 'send_acknowledgement', '{"channels": ["in_app","email"], "include_reference": true, "include_timeline": true}'::JSONB, 0),
  ('Auto-acknowledge incident', 'Send immediate confirmation on new incident report', 'incident.created', '{}'::JSONB, 'send_acknowledgement', '{"channels": ["in_app","email"], "include_reference": true}'::JSONB, 0),
  ('SLA warning at 75%', 'Alert staff when case reaches 75% of SLA target', 'sla.warning', '{"threshold_percent": 75}'::JSONB, 'send_notification', '{"channels": ["in_app"], "urgency": "high"}'::JSONB, 0),
  ('SLA breach alert', 'Alert supervisor when SLA is breached', 'sla.breach', '{"threshold_percent": 100}'::JSONB, 'send_notification', '{"channels": ["in_app","email"], "notify_supervisor": true, "urgency": "critical"}'::JSONB, 0),
  ('Weekly summary report', 'Auto-generate weekly stats report every Monday', 'schedule.weekly', '{"day": "monday", "hour": 8}'::JSONB, 'generate_report', '{"report_type": "weekly"}'::JSONB, 0)
) AS v(name, description, trigger_event, condition, action, action_params, delay_minutes)
WHERE NOT EXISTS (SELECT 1 FROM workflow_rules LIMIT 1);

-- 10. Add reference_number column to complaints if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'complaints' AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE complaints ADD COLUMN reference_number TEXT UNIQUE;
  END IF;
END $$;

-- 11. Add reference_number column to cyber_incidents if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cyber_incidents' AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE cyber_incidents ADD COLUMN reference_number TEXT UNIQUE;
  END IF;
END $$;

-- 12. Update complaints status constraint to include 'escalated'
ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check;
ALTER TABLE complaints ADD CONSTRAINT complaints_status_check
  CHECK (status IN ('new', 'pending', 'submitted', 'in_review', 'assigned', 'in_progress', 'escalated', 'resolved', 'closed'));
