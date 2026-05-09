import { PDFDocument } from 'pdf-lib';
import type { PdfPage, PdfSource } from '../types.ts';

export async function getPdfPageCount(file: File): Promise<number> {
  const buf = await file.arrayBuffer();
  const doc = await PDFDocument.load(buf);
  return doc.getPageCount();
}

export async function exportFilteredPdf(
  sources: PdfSource[],
  pages: PdfPage[],
): Promise<Uint8Array> {
  const newDoc = await PDFDocument.create();
  const loadedDocs = new Map<string, PDFDocument>();

  for (const page of pages) {
    if (!loadedDocs.has(page.sourceId)) {
      const src = sources.find((s) => s.id === page.sourceId);
      if (!src) continue;
      const buf = await src.file.arrayBuffer();
      loadedDocs.set(page.sourceId, await PDFDocument.load(buf));
    }
    const srcDoc = loadedDocs.get(page.sourceId);
    if (!srcDoc) continue;
    const [copied] = await newDoc.copyPages(srcDoc, [page.pageNumber - 1]);
    newDoc.addPage(copied);
  }

  return newDoc.save();
}
