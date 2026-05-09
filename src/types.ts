export interface PdfState {
  file: File;
  fileName: string;
  pageCount: number;
  remainingPages: number[];
  selectedIdx: number;
}
