import { Document, Page } from 'react-pdf';

interface ThumbnailSidebarProps {
  file: File;
  remainingPages: number[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  onDelete: (idx: number) => void;
  onDocumentLoadSuccess: (info: { numPages: number }) => void;
}

export default function ThumbnailSidebar({
  file,
  remainingPages,
  selectedIdx,
  onSelect,
  onDelete,
  onDocumentLoadSuccess,
}: ThumbnailSidebarProps) {
  return (
    <aside className="sidebar">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div className="sidebar__loading">Loading…</div>}
        error={<div className="sidebar__error">Failed to load PDF.</div>}
      >
        <ul className="sidebar__list" role="list">
          {remainingPages.map((pageNumber, idx) => (
            <li
              key={pageNumber}
              className={`sidebar__item${idx === selectedIdx ? ' sidebar__item--selected' : ''}`}
              onClick={() => onSelect(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(idx);
              }}
              aria-label={`Page ${pageNumber}`}
              aria-pressed={idx === selectedIdx}
            >
              <div className="sidebar__thumb">
                <Page
                  pageNumber={pageNumber}
                  width={140}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={<div className="sidebar__thumb-loading" />}
                />
              </div>
              <span className="sidebar__page-num">{pageNumber}</span>
              <button
                type="button"
                className="sidebar__delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idx);
                }}
                aria-label={`Delete page ${pageNumber}`}
                title="Delete page"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </Document>
    </aside>
  );
}
