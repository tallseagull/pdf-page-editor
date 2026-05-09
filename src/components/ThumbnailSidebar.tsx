import { Document, Page } from 'react-pdf';
import type { PdfPage, PdfSource } from '../types.ts';

interface ThumbnailSidebarProps {
  sources: Map<string, PdfSource>;
  pages: PdfPage[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  onDelete: (idx: number) => void;
}

export default function ThumbnailSidebar({
  sources,
  pages,
  selectedIdx,
  onSelect,
  onDelete,
}: ThumbnailSidebarProps) {
  return (
    <aside className="sidebar">
      <ul className="sidebar__list" role="list">
        {pages.map((page, idx) => {
          const source = sources.get(page.sourceId);
          if (!source) return null;
          return (
            <li
              key={`${page.sourceId}-${page.pageNumber}-${idx}`}
              className={`sidebar__item${idx === selectedIdx ? ' sidebar__item--selected' : ''}`}
              onClick={() => onSelect(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(idx);
              }}
              aria-label={`Page ${page.pageNumber}`}
              aria-pressed={idx === selectedIdx}
            >
              <div className="sidebar__thumb">
                <Document
                  file={source.url}
                  loading={<div className="sidebar__thumb-loading" />}
                  error={<div className="sidebar__thumb-loading" />}
                >
                  <Page
                    pageNumber={page.pageNumber}
                    width={140}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={<div className="sidebar__thumb-loading" />}
                  />
                </Document>
              </div>
              <span className="sidebar__page-num">{page.pageNumber}</span>
              <button
                type="button"
                className="sidebar__delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idx);
                }}
                aria-label={`Delete page ${page.pageNumber}`}
                title="Delete page"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
