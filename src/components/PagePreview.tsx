import { Document, Page } from 'react-pdf';

interface PagePreviewProps {
  file: File;
  pageNumber: number;
}

export default function PagePreview({ file, pageNumber }: PagePreviewProps) {
  return (
    <div className="page-preview">
      <Document
        file={file}
        loading={<div className="page-preview__loading">Loading…</div>}
        error={<div className="page-preview__error">Failed to load PDF.</div>}
      >
        <Page
          pageNumber={pageNumber}
          width={720}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={<div className="page-preview__loading">Rendering…</div>}
        />
      </Document>
    </div>
  );
}
