/**
 * Step 3: Extract text from key BOCRA PDFs and chunk into JSON.
 *
 * Run: node scripts/extract-pdfs.cjs
 * Output: src/data/bocra-knowledge.json
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const DOCS_DIR = path.join(__dirname, '..', 'public', 'documents');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'bocra-knowledge.json');

const TARGET_PDFS = [
  'BOCRA Revised Fee Code.pdf',
  'Broadcasting (Fees) Regulations.pdf',
  'FBO Licence Schedule.pdf',
  '32 Act 10-08-2018-Data Protection.pdf',
  'Consumer_Protection_Policy_-_Communications_Sector.pdf',
];

const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;

function chunkText(text, docName) {
  const chunks = [];
  const cleaned = text.replace(/\s+/g, ' ').trim();

  let start = 0;
  let chunkIndex = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    const piece = cleaned.slice(start, end);

    chunks.push({
      docName,
      chunkIndex,
      text: piece,
    });

    chunkIndex++;
    start = end - CHUNK_OVERLAP;
    if (end === cleaned.length) break;
  }

  return chunks;
}

async function main() {
  const allChunks = [];
  let successCount = 0;
  let failCount = 0;

  for (const pdfName of TARGET_PDFS) {
    const pdfPath = path.join(DOCS_DIR, pdfName);

    if (!fs.existsSync(pdfPath)) {
      console.log(`SKIP: ${pdfName} -- file not found`);
      failCount++;
      continue;
    }

    try {
      const buffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(buffer);
      const text = data.text;

      if (!text || text.trim().length < 50) {
        console.log(`SKIP: ${pdfName} -- no readable text`);
        failCount++;
        continue;
      }

      const chunks = chunkText(text, pdfName);
      allChunks.push(...chunks);
      successCount++;
      console.log(`OK: ${pdfName} -- ${chunks.length} chunks (${text.length} chars)`);
    } catch (err) {
      console.log(`FAIL: ${pdfName} -- ${err.message}`);
      failCount++;
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allChunks, null, 2));
  console.log(`\nDone! ${successCount} PDFs processed, ${failCount} skipped.`);
  console.log(`Total chunks: ${allChunks.length}`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main().catch(console.error);
