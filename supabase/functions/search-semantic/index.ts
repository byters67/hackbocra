/**
 * Supabase Edge Function — Semantic Search
 *
 * Phase 5: Meaning-based search for the BOCRA website.
 *
 * Flow:
 *   1. Accept query string + optional filters
 *   2. Detect language (EN/TN) from query text
 *   3. Generate query embedding via OpenAI text-embedding-3-small
 *   4. Run cosine similarity search against search_embeddings (pgvector)
 *   5. If semantic returns 0 results or embedding fails → keyword fallback
 *   6. Deduplicate by content_id, log analytics event, return results
 *
 * Deploy:
 *   supabase secrets set OPENAI_API_KEY=sk-...
 *   supabase functions deploy search-semantic
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// CORS headers (match pattern from existing edge functions)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// ─── LANGUAGE DETECTION ──────────────────────────────────────────
// Heuristic: if query contains ≥2 Setswana indicator words or >40%
// of words are Setswana, treat as TN. Otherwise EN.

const SETSWANA_INDICATORS = new Set([
  'ke', 'ga', 'ba', 'le', 'mo', 'go', 'ya', 'wa', 'di', 'se',
  'ka', 're', 'lo', 'bo', 'tla', 'na', 'nna', 'wena', 'rona',
  'bona', 'eng', 'kae', 'goreng', 'jang', 'nako', 'motho',
  'batla', 'thusa', 'kwala', 'kgalemo', 'ngongorego', 'ditirelo',
]);

function detectLanguage(query: string): 'en' | 'tn' {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return 'en';
  const tnCount = words.filter((w) => SETSWANA_INDICATORS.has(w)).length;
  return tnCount >= 2 || tnCount / words.length > 0.4 ? 'tn' : 'en';
}

// ─── EMBEDDING GENERATION ────────────────────────────────────────
// Calls OpenAI text-embedding-3-small. Returns null on failure
// (which triggers keyword fallback — never errors to the user).

async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) {
    console.error('[search-semantic] OPENAI_API_KEY not set');
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        `[search-semantic] OpenAI API error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (err) {
    clearTimeout(timeout);
    console.error('[search-semantic] Embedding generation failed:', (err as Error).message);
    return null;
  }
}

// ─── KEYWORD FALLBACK ────────────────────────────────────────────
// Full-text search on the search_embeddings table using the GIN index.
// Activated when embedding generation fails or returns 0 results.

async function keywordSearch(
  supabase: ReturnType<typeof createClient>,
  query: string,
  language: string,
  contentType: string | null,
  sector: string | null,
  limit: number,
) {
  // Build a websearch-compatible query: split words and join with &
  const tsQuery = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .join(' & ');

  if (!tsQuery) return [];

  let rpcQuery = supabase
    .from('search_embeddings')
    .select(
      'id, content_type, content_id, title, chunk_text, url, language, metadata, sector',
    )
    .eq('language', language)
    .textSearch('title', tsQuery, { type: 'websearch', config: 'english' })
    .limit(limit);

  if (contentType) rpcQuery = rpcQuery.eq('content_type', contentType);
  if (sector) rpcQuery = rpcQuery.eq('sector', sector);

  const { data, error } = await rpcQuery;

  if (error) {
    console.error('[search-semantic] Keyword search error:', error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    ...row,
    similarity: 0.5,
  }));
}

// ─── MAIN HANDLER ────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      query,
      content_type: contentType = null,
      sector = null,
      language: langOverride = null,
      limit = 10,
    } = body;

    // Validate
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return jsonRes({ error: 'Query is required' }, 400);
    }

    const cleanQuery = query.trim().slice(0, 500);
    const language = langOverride || detectLanguage(cleanQuery);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Try semantic search
    const embedding = await generateEmbedding(cleanQuery);
    let results: Record<string, unknown>[] = [];
    let searchMode = 'semantic';

    if (embedding) {
      const { data, error } = await supabase.rpc('match_search_embeddings', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: Math.min(limit, 20),
        filter_language: language,
        filter_content_type: contentType,
        filter_sector: sector,
      });

      if (error) {
        console.error('[search-semantic] RPC error:', error);
      } else {
        results = data || [];
      }
    }

    // 2. Fallback to keyword if semantic returned nothing or failed
    if (results.length === 0) {
      searchMode = 'fallback';
      results = await keywordSearch(
        supabase,
        cleanQuery,
        language,
        contentType,
        sector,
        Math.min(limit, 20),
      );
    }

    // 3. Deduplicate by content_type:content_id (keep highest similarity)
    const seen = new Set<string>();
    const deduplicated = results.filter((r) => {
      const key = `${r.content_type}:${r.content_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 4. Log search event (fire-and-forget)
    supabase
      .from('search_events')
      .insert({
        event_type:
          deduplicated.length > 0 ? 'search_executed' : 'search_no_results',
        query_text: cleanQuery,
        results_count: deduplicated.length,
        search_mode: searchMode,
        language,
      })
      .then(() => {})
      .catch((err: Error) =>
        console.error('[search-semantic] Event log failed:', err),
      );

    return jsonRes({
      results: deduplicated,
      search_mode: searchMode,
      language,
      total: deduplicated.length,
    });
  } catch (err) {
    console.error('[search-semantic] Error:', err);
    return jsonRes({ error: 'Internal server error' }, 500);
  }
});

function jsonRes(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
