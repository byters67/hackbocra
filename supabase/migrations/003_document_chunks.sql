-- Step 4: Document chunks table for RAG context-stuffing
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
