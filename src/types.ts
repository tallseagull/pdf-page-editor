export interface PdfSource {
  id: string;
  file: File;
  url: string;
  pageCount: number;
}

export interface PdfPage {
  instanceId: string;
  sourceId: string;
  pageNumber: number;
}

export type ViewMode = 'slide' | 'thumbnail';
