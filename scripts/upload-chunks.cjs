/**
 * Step 4: Upload extracted chunks to Supabase document_chunks table.
 *
 * Run: node scripts/upload-chunks.cjs
 *
 * Prerequisites:
 *   1. Run the migration 003_document_chunks.sql in Supabase SQL Editor
 *   2. Have bocra-knowledge.json generated from extract-pdfs.cjs
 *   3. Set environment variables:
 *        SUPABASE_URL=https://your-project.supabase.co
 *        SUPABASE_ANON_KEY=your-anon-key
 *      Or create a .env file in the project root.
 */

const fs = require('fs');
const path = require('path');

const CHUNKS_FILE = path.join(__dirname, '..', 'src', 'data', 'bocra-knowledge.json');

// V-01 remediation: Load keys from environment variables only
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Missing required environment variables.\n' +
    'Set SUPABASE_URL and SUPABASE_ANON_KEY before running this script.\n\n' +
    'Example:\n' +
    '  SUPABASE_URL=https://your-project.supabase.co SUPABASE_ANON_KEY=your-key node scripts/upload-chunks.cjs'
  );
  process.exit(1);
}

async function main() {
  const raw = fs.readFileSync(CHUNKS_FILE, 'utf-8');
  const chunks = JSON.parse(raw);

  console.log(`Loaded ${chunks.length} chunks from ${CHUNKS_FILE}`);

  // Transform to match table columns
  const rows = chunks.map(c => ({
    doc_name: c.docName,
    chunk_index: c.chunkIndex,
    content: c.text,
  }));

  // Upload in batches of 20
  const BATCH_SIZE = 20;
  let uploaded = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/document_chunks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(batch),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`FAIL batch ${i}: ${res.status} ${errText}`);
      process.exit(1);
    }

    uploaded += batch.length;
    console.log(`Uploaded ${uploaded}/${rows.length} chunks...`);
  }

  console.log(`\nDone! ${uploaded} chunks uploaded to document_chunks table.`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
