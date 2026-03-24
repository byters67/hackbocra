# Azure Production Migration Plan

## Component Mapping

| Current (Hackathon) | Azure Equivalent | Effort |
|---------------------|-----------------|--------|
| Supabase Edge Functions (6) | Azure Functions (Deno runtime) | 1 week |
| Supabase PostgreSQL | Azure Database for PostgreSQL Flexible Server | 2 days |
| PgBouncer (Supabase built-in) | PgBouncer (Azure Flexible Server built-in) | 0 — included |
| GitHub Pages | Azure Static Web Apps | 1 day |
| Supabase Auth | Azure AD B2C or keep Supabase Auth | 1 week if migrating |
| No CDN | Azure Front Door (CDN + WAF + geo-failover) | 1 day |
| Custom health check | Azure Monitor + Application Insights | 2 days |
| Let's Encrypt TLS | Azure-managed certificates | 0 — automatic |

## Why Not Azure Now?

Migrating during the competition would introduce unvalidated risk. The current Supabase architecture was chosen for rapid prototyping and is **architecturally portable** — every component maps 1:1 to an Azure equivalent.

## Estimated Cost

- **Current (Supabase Pro):** ~$25/month
- **Azure Production:** ~$200-400/month
- **Azure with geo-redundancy:** ~$500-800/month

## Timeline

- **Phase 1 (2 weeks):** Migrate Edge Functions → Azure Functions, static site → Azure Static Web Apps
- **Phase 2 (1 week):** Migrate database with pg_dump/pg_restore, validate RLS policies
- **Phase 3 (1 week):** Azure Front Door CDN, Azure Monitor, geo-redundancy (JHB + CPT)

## Key Benefit for BOCRA

Azure Government Cloud meets Botswana government data sovereignty requirements. Azure Flexible Server includes built-in PgBouncer, automated backups, and geo-redundant failover.
