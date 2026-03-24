-- =============================================================
-- 016: Performance indexes for RLS and foreign key lookups
-- =============================================================

-- CRITICAL: Used in every RLS staff/admin policy check
-- Without this, EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN (...))
-- does a sequential scan on every authenticated admin query
CREATE INDEX IF NOT EXISTS idx_profiles_id_role ON profiles(id, role);

-- Foreign key indexes (missing — causes slow JOINs and cascading deletes)
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_licence_applications_assigned_to ON licence_applications(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cyber_incidents_assigned_to ON cyber_incidents(assigned_to);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_type_approvals_applicant_id ON type_approvals(applicant_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
