# BOCRA — Query Performance Analysis

## How to Run

Execute these queries in the Supabase SQL Editor to verify index usage:

```sql
-- Complaint listing (admin page)
EXPLAIN ANALYZE
SELECT * FROM complaints ORDER BY created_at DESC LIMIT 50;

-- RLS check performance (runs on EVERY authenticated query)
EXPLAIN ANALYZE
SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff');

-- Rate limit check
EXPLAIN ANALYZE
SELECT count(*) FROM rate_limits
WHERE ip_hash = 'test' AND form_type = 'contact'
AND submitted_at >= now() - interval '1 minute';

-- Audit log query
EXPLAIN ANALYZE
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100;
```

## Expected Results

After migration 016 (performance indexes), all queries should show **Index Scan** (not Seq Scan):

| Query | Expected Plan | Index Used |
|-------|--------------|------------|
| Complaint listing | Index Scan on complaints_created_at | `idx_complaints_created_at` |
| RLS check | Index Scan on profiles | `idx_profiles_id_role` (composite) |
| Rate limit check | Index Scan on rate_limits | `idx_rate_limits_lookup` (composite) |
| Audit log | Index Scan on audit_log | `idx_error_logs_created` |

## Indexes Added (Migration 016)

```sql
idx_profiles_id_role                    -- (id, role) — used in every RLS policy
idx_complaints_assigned_to              -- FK index for staff assignment
idx_licence_applications_assigned_to    -- FK index for staff assignment
idx_cyber_incidents_assigned_to         -- FK index for staff assignment
idx_notifications_user_read             -- (user_id, read) — notification lookup
idx_posts_author_id                     -- FK index for news posts
idx_type_approvals_applicant_id         -- FK index for type approval
idx_documents_uploaded_by               -- FK index for document ownership
idx_error_logs_created                  -- error log listing (created_at DESC)
idx_error_logs_type                     -- error type filtering (error_type, created_at DESC)
```

## Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| RLS policy check | < 1ms | EXPLAIN ANALYZE |
| Admin page load (50 rows) | < 100ms | Supabase Dashboard |
| Rate limit check | < 5ms | EXPLAIN ANALYZE |
| Health endpoint | < 200ms | scripts/uptime-check.js |
| Lighthouse Performance | > 90 | Chrome DevTools |
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |

## Notes

- Run `EXPLAIN ANALYZE` after deploying migration 016 to get actual numbers
- Paste results into this file for judge reference
- If any query shows Seq Scan, investigate missing indexes
