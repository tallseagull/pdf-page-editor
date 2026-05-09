export interface PdfSource {
  id: string;
  file: File;
  url: string;
  pageCount: number;
}

export interface PdfPage {
  sourceId: string;
  pageNumber: number;
}
