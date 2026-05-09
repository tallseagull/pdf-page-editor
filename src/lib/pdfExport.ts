import { PDFDocument } from 'pdf-lib';

export async function exportFilteredPdf(
  originalFile: File,
  pageNumbers: number[],
): Promise<Uint8Array> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();

  const zeroBasedIndices = pageNumbers.map((n) => n - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, zeroBasedIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  return newDoc.save();
}
