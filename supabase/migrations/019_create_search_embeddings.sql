-- =============================================================================
-- BOCRA Website — Migration 019: Semantic Search Embeddings Table
-- =============================================================================
--
-- Phase 5: Stores vector embeddings for all searchable content (pages,
-- documents, FAQs, consultations, news, knowledge base).
--
-- Works alongside (not replacing) the existing document_chunks table used
-- by the RAG chatbot. A separate table allows chunk sizes optimized for
-- embedding (300-500 tokens) independently of the chatbot's larger chunks.
--
-- Requires: migration 018 (pgvector extension)
-- =============================================================================

CREATE TABLE IF NOT EXISTS search_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content identification
  content_type TEXT NOT NULL CHECK (content_type IN (
    'page', 'document', 'faq', 'consultation', 'news', 'knowledge_base'
  )),
  content_id TEXT NOT NULL,
  document_chunk_id INTEGER,

  -- Searchable text
  title TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  url TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'tn')),

  -- Vector embedding (1536 dimensions = OpenAI text-embedding-3-small)
  embedding VECTOR(1536) NOT NULL,

  -- Metadata for filtering
  metadata JSONB DEFAULT '{}'::jsonb,
  sector TEXT,
  published_date DATE,

  -- Housekeeping
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- HNSW index for fast approximate nearest-neighbor search
-- m=16, ef_construction=64 are good defaults for < 10K vectors
CREATE INDEX idx_search_embeddings_hnsw
  ON search_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Composite indexes for filtered search
CREATE INDEX idx_search_embeddings_type_lang
  ON search_embeddings (content_type, language);

CREATE INDEX idx_search_embeddings_sector
  ON search_embeddings (sector)
  WHERE sector IS NOT NULL;

-- Full-text search index for keyword fallback
CREATE INDEX idx_search_embeddings_text_search
  ON search_embeddings
  USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(chunk_text, '')));

-- Unique constraint for upsert support
CREATE UNIQUE INDEX idx_search_embeddings_content_unique
  ON search_embeddings (content_type, content_id, language);

-- RLS: Public read access (search is public), no public write
ALTER TABLE search_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read search embeddings"
  ON search_embeddings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only service role can manage search embeddings"
  ON search_embeddings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_search_embeddings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_search_embeddings_updated_at
  BEFORE UPDATE ON search_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_search_embeddings_timestamp();

-- =============================================================================
-- Semantic search function (called by the search-semantic edge function)
-- Returns results ranked by cosine similarity with optional filters.
-- =============================================================================

CREATE OR REPLACE FUNCTION match_search_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 10,
  filter_language TEXT DEFAULT 'en',
  filter_content_type TEXT DEFAULT NULL,
  filter_sector TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content_type TEXT,
  content_id TEXT,
  title TEXT,
  chunk_text TEXT,
  url TEXT,
  language TEXT,
  metadata JSONB,
  sector TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    se.id,
    se.content_type,
    se.content_id,
    se.title,
    se.chunk_text,
    se.url,
    se.language,
    se.metadata,
    se.sector,
    (1 - (se.embedding <=> query_embedding))::FLOAT AS similarity
  FROM search_embeddings se
  WHERE
    (1 - (se.embedding <=> query_embedding)) > match_threshold
    AND se.language = filter_language
    AND (filter_content_type IS NULL OR se.content_type = filter_content_type)
    AND (filter_sector IS NULL OR se.sector = filter_sector)
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
