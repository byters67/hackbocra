-- =============================================================================
-- BOCRA Website — Migration 018: Enable pgvector Extension
-- =============================================================================
--
-- Prerequisite for Phase 5 (Semantic Search).
-- pgvector adds the VECTOR column type and similarity operators (<=>)
-- needed for embedding-based search.
--
-- VERIFY BEFORE RUNNING:
--   SELECT * FROM pg_available_extensions WHERE name = 'vector';
--   (Must return a row — if not, upgrade your Supabase plan)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;
