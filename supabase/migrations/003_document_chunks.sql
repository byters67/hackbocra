-- =============================================================================
-- BOCRA Website — Migration 003b: Document Chunks for RAG Chatbot
-- =============================================================================
--
-- Stores pre-chunked text from BOCRA's official documents (legislation,
-- licensing frameworks, pricing schedules, etc.) for the AI chat assistant.
--
-- HOW IT WORKS (Retrieval-Augmented Generation):
--   1. BOCRA documents are split into ~500-word chunks (via scripts/insert-chunks.sql)
--   2. When a citizen asks a question, the chat Edge Function extracts keywords
--   3. Chunks are scored by keyword overlap and the top 30 are sent to Claude
--   4. Claude answers using only BOCRA's official documents as context
--
-- This approach ensures the chatbot gives accurate, document-backed answers
-- rather than hallucinating. See supabase/functions/chat/index.ts.
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_chunks (
  id SERIAL PRIMARY KEY,
  doc_name TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow public read access (Edge Functions use service role, but just in case)
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on document_chunks"
  ON document_chunks FOR SELECT
  USING (true);
