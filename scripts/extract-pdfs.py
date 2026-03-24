"""
Step 3: Extract text from key BOCRA PDFs and chunk into JSON.

Run: python scripts/extract-pdfs.py
Output: src/data/bocra-knowledge.json
"""

import json
import os
import PyPDF2

DOCS_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'documents')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'bocra-knowledge.json')

TARGET_PDFS = [
    'BOCRA Revised Fee Code.pdf',
    'Broadcasting (Fees) Regulations.pdf',
    'FBO Licence Schedule.pdf',
    '32 Act 10-08-2018-Data Protection.pdf',
    'Complaints Handling Procedures.pdf',
]

CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200


def chunk_text(text, doc_name):
    chunks = []
    # Collapse whitespace
    import re
    cleaned = re.sub(r'\s+', ' ', text).strip()

    start = 0
    chunk_index = 0

    while start < len(cleaned):
        end = min(start + CHUNK_SIZE, len(cleaned))
        chunk = cleaned[start:end]

        chunks.append({
            'docName': doc_name,
            'chunkIndex': chunk_index,
            'text': chunk,
        })

        chunk_index += 1
        start = end - CHUNK_OVERLAP

        if end == len(cleaned):
            break

    return chunks


def main():
    all_chunks = []
    success = 0
    fail = 0

    for pdf_name in TARGET_PDFS:
        pdf_path = os.path.join(DOCS_DIR, pdf_name)

        if not os.path.exists(pdf_path):
            print(f'SKIP: {pdf_name} -- file not found')
            fail += 1
            continue

        try:
            reader = PyPDF2.PdfReader(pdf_path)
            text = ''
            for page in reader.pages:
                text += (page.extract_text() or '')

            if len(text.strip()) < 50:
                print(f'SKIP: {pdf_name} -- no readable text')
                fail += 1
                continue

            chunks = chunk_text(text, pdf_name)
            all_chunks.extend(chunks)
            success += 1
            print(f'OK: {pdf_name} -- {len(chunks)} chunks ({len(text)} chars)')
        except Exception as e:
            print(f'FAIL: {pdf_name} -- {e}')
            fail += 1

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)

    print(f'\nDone! {success} PDFs processed, {fail} skipped.')
    print(f'Total chunks: {len(all_chunks)}')
    print(f'Output: {OUTPUT_FILE}')


if __name__ == '__main__':
    main()
