/**
 * BOCRA Semantic Search — Embedding Generation Pipeline
 *
 * Reads all searchable content, generates OpenAI embeddings, and upserts
 * into the search_embeddings table. Designed to be re-run safely (idempotent).
 *
 * Content sources:
 *   1. document_chunks table (existing RAG data — re-chunked for embedding)
 *   2. bocra-knowledge.json (chatbot knowledge base)
 *   3. SEARCH_INDEX pages (hardcoded page index from SearchPage.jsx)
 *
 * Usage:
 *   SUPABASE_URL=https://cyalwtuladeexxfsbrcs.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your_key \
 *   OPENAI_API_KEY=sk-... \
 *   node scripts/generate-embeddings.js
 *
 * Requires: Node 18+ (for native fetch)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_KEY) {
  console.error(
    'Missing required environment variables:\n' +
      '  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── CHUNKING ────────────────────────────────────────────────────

function chunkText(text, maxTokens = 400, overlap = 50) {
  const maxChars = maxTokens * 4;
  const overlapChars = overlap * 4;
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChars;

    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      if (lastPeriod > start + maxChars * 0.5) {
        end = lastPeriod + 1;
      }
    }

    chunks.push(text.slice(start, Math.min(end, text.length)).trim());
    start = end - overlapChars;
  }

  return chunks.filter((c) => c.length > 30);
}

// ─── EMBEDDING ───────────────────────────────────────────────────

async function embedBatch(texts) {
  const batchSize = 100;
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: batch.map((t) => t.slice(0, 8000)),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    allEmbeddings.push(...data.data.map((d) => d.embedding));

    // Rate limit: 200ms between batches
    if (i + batchSize < texts.length) {
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(
      `  Embedded ${Math.min(i + batchSize, texts.length)}/${texts.length} chunks`,
    );
  }

  return allEmbeddings;
}

// ─── CONTENT LOADERS ─────────────────────────────────────────────

async function loadDocumentChunks() {
  console.log('  Loading document_chunks from Supabase...');
  const { data, error } = await supabase
    .from('document_chunks')
    .select('id, doc_name, chunk_index, content');

  if (error) {
    console.error('  Error loading document_chunks:', error.message);
    return [];
  }

  const items = [];
  for (const doc of data || []) {
    // Re-chunk if content is too large for embedding
    const chunks =
      doc.content.length > 2000
        ? chunkText(doc.content)
        : [doc.content.trim()];

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      if (chunk.length < 30) continue;

      items.push({
        content_type: 'document',
        content_id: `doc-${doc.id}-${ci}`,
        document_chunk_id: doc.id,
        title: doc.doc_name || 'Untitled Document',
        chunk_text: chunk,
        url: '/documents/drafts',
        language: 'en',
        metadata: { doc_name: doc.doc_name, chunk_index: doc.chunk_index },
        sector: guessSector(doc.doc_name),
      });
    }
  }

  return items;
}

function loadKnowledgeBase() {
  const filePath = resolve(__dirname, '../src/data/bocra-knowledge.json');

  if (!existsSync(filePath)) {
    console.log('  WARNING: bocra-knowledge.json not found');
    return [];
  }

  const kb = JSON.parse(readFileSync(filePath, 'utf8'));
  const items = [];

  // Knowledge base format: array of { docName, chunkIndex, text }
  for (let i = 0; i < kb.length; i++) {
    const entry = kb[i];
    const text = entry.text || entry.content || '';
    if (text.length < 30) continue;

    // Re-chunk large entries
    const chunks = text.length > 2000 ? chunkText(text) : [text.trim()];

    for (let ci = 0; ci < chunks.length; ci++) {
      items.push({
        content_type: 'knowledge_base',
        content_id: `kb-${i}-${ci}`,
        title: entry.docName || entry.topic || 'Knowledge Base',
        chunk_text: chunks[ci],
        url: null,
        language: 'en',
        metadata: {
          doc_name: entry.docName,
          chunk_index: entry.chunkIndex,
        },
        sector: guessSector(entry.docName || ''),
      });
    }
  }

  return items;
}

function loadPageIndex() {
  // Hardcoded page index from SearchPage.jsx — the canonical list of site pages
  const pages = [
    { title: 'About BOCRA', path: '/about/profile', category: 'About', description: 'Mission, vision, values, and core business areas of BOCRA.' },
    { title: 'Chief Executive', path: '/about/chief-executive', category: 'About', description: 'Message from the Chief Executive Mr. Martin Mokgware.' },
    { title: 'Board of Directors', path: '/about/board', category: 'About', description: 'Dr. Bokamoso Basutli (Chair), Mr. Moabi Pusumane, and board members.' },
    { title: 'Executive Management', path: '/about/executive-management', category: 'About', description: 'Martin Mokgware, Murphy Setshwane, Peter Tladinyane, and leadership team.' },
    { title: 'History of Communication Regulation', path: '/about/history', category: 'About', description: 'Timeline from 2003 BTA to 2013 BOCRA establishment and modern framework.' },
    { title: 'Organogram', path: '/about/organogram', category: 'About', description: 'Organisational structure and departments of BOCRA.' },
    { title: 'Careers', path: '/about/careers', category: 'About', description: 'Job opportunities at BOCRA.' },
    { title: 'Telecommunications', path: '/mandate/telecommunications', category: 'Mandate', description: 'Regulation of Mascom, BTC, Orange. NFP, SAP, VANS licensing.', sector: 'telecoms' },
    { title: 'Broadcasting', path: '/mandate/broadcasting', category: 'Mandate', description: 'Regulation of Yarona FM, Duma FM, Gabz FM, eBotswana TV.', sector: 'broadcasting' },
    { title: 'Postal Services', path: '/mandate/postal', category: 'Mandate', description: 'Universal postal services and commercial postal operators.', sector: 'postal' },
    { title: 'Internet & ICT', path: '/mandate/internet', category: 'Mandate', description: 'Broadband, cybersecurity, .bw domain, EASSy cable.', sector: 'internet_ict' },
    { title: 'Legislation', path: '/mandate/legislation', category: 'Mandate', description: 'CRA Act, Electronic Records Act, ECT Act, Digital Services Act.' },
    { title: 'Licensing Framework', path: '/mandate/licensing', category: 'Mandate', description: 'NFP, SAP, CSP licence categories for telecoms, broadcasting, postal.' },
    { title: 'File a Complaint', path: '/services/file-complaint', category: 'Services', description: 'Online complaint form for telecoms, broadcasting, postal issues. File a complaint against Mascom, BTC, Orange, or any licensed operator.' },
    { title: 'Cybersecurity Hub', path: '/cybersecurity', category: 'Services', description: 'Report cyber incidents, safety tips, live CVE alerts, CSIRT contact, SIM swap protection, phishing.', sector: 'internet_ict' },
    { title: 'Apply for a Licence', path: '/licensing', category: 'Services', description: 'All 13 licence types: Aircraft Radio, Amateur Radio, Broadcasting, Cellular, Citizen Band, Point-to-Point, Private Radio, Radio Dealers, Radio Frequency, Satellite, Type Approval, VANS.' },
    { title: 'Licence Verification', path: '/services/licence-verification', category: 'Services', description: 'Verify if an operator holds a valid BOCRA licence.' },
    { title: 'Type Approval', path: '/services/type-approval', category: 'Services', description: 'Equipment approval database and type approval applications.' },
    { title: 'Register .BW Domain', path: '/services/register-bw', category: 'Services', description: 'Register a .bw country-code domain name. WHOIS lookup, registrars.', sector: 'internet_ict' },
    { title: 'QoS Monitoring', path: '/services/qos-monitoring', category: 'Services', description: 'Network quality data for Mascom, BTC, Orange operators.', sector: 'telecoms' },
    { title: 'Spectrum Management', path: '/services/spectrum', category: 'Services', description: 'ASMS-WebCP, frequency plan, spectrum allocation.', sector: 'telecoms' },
    { title: 'Telecom Statistics', path: '/telecom-statistics', category: 'Data', description: 'Mobile subscriptions, broadband, mobile money statistics charts.', sector: 'telecoms' },
    { title: 'Documents & Legislation', path: '/documents/drafts', category: 'Documents', description: '420+ documents: acts, regulations, guidelines, annual reports, consultation papers.' },
    { title: 'ICT Licensing Framework', path: '/documents/ict-licensing', category: 'Documents', description: 'ICT licensing framework, application requirements, fees, licensed operators.' },
    { title: 'News', path: '/media/news', category: 'Media', description: 'Latest BOCRA announcements, industry updates, consumer news.' },
    { title: 'News & Events', path: '/media/news-events', category: 'Media', description: 'Public notices, tenders, media releases, regulatory documents.' },
    { title: 'Contact Us', path: '/contact', category: 'Contact', description: 'BOCRA contact details, address, phone, email, enquiry form.' },
    { title: 'FAQs', path: '/faqs', category: 'Help', description: 'Frequently asked questions about BOCRA services.' },
    { title: 'Consumer Education', path: '/complaints/consumer-education', category: 'Consumer', description: 'Consumer rights: right to be informed, choice, heard, safety.' },
    { title: 'Privacy Notice', path: '/privacy-notice', category: 'Legal', description: 'How BOCRA collects, uses, and protects personal data.' },
    { title: 'Public Consultations', path: '/consultations', category: 'Services', description: 'Have your say on proposed regulations and policies. Submit responses to open consultations.' },
    { title: 'Speeches Archive', path: '/media/speeches', category: 'Media', description: 'Speeches by BOCRA Chief Executive and senior leadership.' },
    { title: 'Data Subject Access Request', path: '/portal/data-request', category: 'Services', description: 'Exercise your rights under the Botswana Data Protection Act 2024.' },
  ];

  return pages.map((p) => ({
    content_type: 'page',
    content_id: `page-${p.path.replace(/\//g, '-')}`,
    title: p.title,
    chunk_text: `${p.title}. ${p.description}`,
    url: p.path,
    language: 'en',
    metadata: { category: p.category },
    sector: p.sector || null,
  }));
}

// ─── SECTOR GUESSING ─────────────────────────────────────────────

function guessSector(text) {
  const lower = (text || '').toLowerCase();
  if (/broadcast|radio|television|tv|fm\b/.test(lower)) return 'broadcasting';
  if (/postal|mail|parcel|post\b/.test(lower)) return 'postal';
  if (/internet|cyber|domain|\.bw|ict|digital/.test(lower))
    return 'internet_ict';
  if (/telecom|mobile|spectrum|gsm|cellular|mascom|btc|orange|frequency/.test(lower))
    return 'telecoms';
  return null;
}

// ─── MAIN ────────────────────────────────────────────────────────

async function main() {
  console.log('=== BOCRA Semantic Search \u2014 Embedding Pipeline ===\n');
  const startTime = Date.now();

  // 1. Load all content sources
  console.log('Loading content...');

  const documents = await loadDocumentChunks();
  console.log(`  Document chunks: ${documents.length}`);

  const kb = loadKnowledgeBase();
  console.log(`  Knowledge base: ${kb.length}`);

  const pages = loadPageIndex();
  console.log(`  Pages: ${pages.length}`);

  const allItems = [...documents, ...kb, ...pages];
  console.log(`\nTotal: ${allItems.length} chunks to embed\n`);

  if (allItems.length === 0) {
    console.log('No content to embed. Exiting.');
    return;
  }

  // 2. Generate embeddings
  console.log('Generating embeddings...');
  const texts = allItems.map((item) => item.chunk_text);
  const embeddings = await embedBatch(texts);

  // 3. Upsert to database
  console.log('\nUpserting to search_embeddings table...');
  const rows = allItems.map((item, i) => ({
    ...item,
    embedding: JSON.stringify(embeddings[i]),
  }));

  const upsertBatch = 200;
  let upserted = 0;

  for (let i = 0; i < rows.length; i += upsertBatch) {
    const batch = rows.slice(i, i + upsertBatch);
    const { error } = await supabase.from('search_embeddings').upsert(batch, {
      onConflict: 'content_type,content_id,language',
    });

    if (error) {
      console.error(`  Upsert error at batch ${i}:`, error.message);
    } else {
      upserted += batch.length;
      console.log(
        `  Upserted ${Math.min(i + upsertBatch, rows.length)}/${rows.length}`,
      );
    }
  }

  // 4. Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const estTokens = texts.reduce((sum, t) => sum + t.length / 4, 0);
  const estCost = ((estTokens * 0.02) / 1_000_000).toFixed(4);

  console.log('\n=== Complete ===');
  console.log(`  Chunks embedded: ${allItems.length}`);
  console.log(`  Chunks upserted: ${upserted}`);
  console.log(`  Estimated tokens: ${Math.round(estTokens).toLocaleString()}`);
  console.log(`  Estimated cost: $${estCost}`);
  console.log(`  Time: ${elapsed}s`);
}

main().catch((err) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
