/**
 * Generates a SQL INSERT file from bocra-knowledge.json
 * that you can paste into the Supabase SQL Editor.
 *
 * Run: node scripts/generate-insert-sql.cjs
 * Output: scripts/insert-chunks.sql
 */

const fs = require('fs');
const path = require('path');

const CHUNKS_FILE = path.join(__dirname, '..', 'src', 'data', 'bocra-knowledge.json');
const OUTPUT_FILE = path.join(__dirname, 'insert-chunks.sql');

const raw = fs.readFileSync(CHUNKS_FILE, 'utf-8');
const chunks = JSON.parse(raw);

let sql = '-- Auto-generated: insert document chunks for RAG\n';
sql += '-- Paste this into Supabase SQL Editor and click Run\n\n';

// Clear existing chunks first
sql += 'DELETE FROM document_chunks;\n\n';

// Build INSERT statements in batches of 10
for (let i = 0; i < chunks.length; i += 10) {
  const batch = chunks.slice(i, i + 10);

  sql += 'INSERT INTO document_chunks (doc_name, chunk_index, content) VALUES\n';

  const values = batch.map(c => {
    // Escape single quotes for SQL
    const escaped = c.text.replace(/'/g, "''");
    return `  ('${c.docName.replace(/'/g, "''")}', ${c.chunkIndex}, '${escaped}')`;
  });

  sql += values.join(',\n') + ';\n\n';
}

sql += `-- Done! ${chunks.length} chunks inserted.\n`;

fs.writeFileSync(OUTPUT_FILE, sql);
console.log(`Generated ${OUTPUT_FILE}`);
console.log(`${chunks.length} chunks in SQL INSERT statements.`);
console.log(`\nNext: Open that file, copy ALL contents, paste into Supabase SQL Editor, click Run.`);
