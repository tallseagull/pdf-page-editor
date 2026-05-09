import { Document, Page } from 'react-pdf';

interface PagePreviewProps {
  url: string;
  pageNumber: number;
}

export default function PagePreview({ url, pageNumber }: PagePreviewProps) {
  return (
    <div className="page-preview">
      <Document
        file={url}
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
