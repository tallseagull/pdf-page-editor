import { useCallback, useMemo, useState } from 'react';
import './App.css';
import PagePreview from './components/PagePreview.tsx';
import PdfUploader from './components/PdfUploader.tsx';
import ThumbnailGrid from './components/ThumbnailGrid.tsx';
import ThumbnailSidebar from './components/ThumbnailSidebar.tsx';
import ViewToggle from './components/ViewToggle.tsx';
import { exportFilteredPdf, getPdfPageCount } from './lib/pdfExport.ts';
import type { PdfPage, PdfSource, ViewMode } from './types.ts';

function makePagesForSource(sourceId: string, pageCount: number): PdfPage[] {
  return Array.from({ length: pageCount }, (_, i) => ({
    instanceId: crypto.randomUUID(),
    sourceId,
    pageNumber: i + 1,
  }));
}

export default function App() {
  const [sources, setSources] = useState<PdfSource[]>([]);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('slide');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasContent = sources.length > 0;

  const totalOriginal = useMemo(
    () => sources.reduce((sum, s) => sum + s.pageCount, 0),
    [sources],
  );

  const sourceMap = useMemo(
    () => new Map(sources.map((s) => [s.id, s])),
    [sources],
  );

  const handleOpenPdf = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSources((prev) => {
      prev.forEach((s) => URL.revokeObjectURL(s.url));
      return [];
    });
    setPages([]);
    setSelectedIdx(0);
    try {
      const pageCount = await getPdfPageCount(file);
      const id = crypto.randomUUID();
      const url = URL.createObjectURL(file);
      setSources([{ id, file, url, pageCount }]);
      setPages(makePagesForSource(id, pageCount));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load PDF.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddPdf = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const pageCount = await getPdfPageCount(file);
      const id = crypto.randomUUID();
      const url = URL.createObjectURL(file);
      setSources((prev) => [...prev, { id, file, url, pageCount }]);
      setPages((prev) => [...prev, ...makePagesForSource(id, pageCount)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load PDF.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setSources((prev) => {
      prev.forEach((s) => URL.revokeObjectURL(s.url));
      return [];
    });
    setPages([]);
    setSelectedIdx(0);
    setError(null);
  }, []);

  const handleDeletePage = useCallback((idxToDelete: number) => {
    setPages((prev) => {
      const next = prev.filter((_, i) => i !== idxToDelete);
      setSelectedIdx((sel) => {
        if (next.length === 0) return 0;
        if (idxToDelete < sel) return sel - 1;
        if (idxToDelete === sel) return Math.min(sel, next.length - 1);
        return sel;
      });
      return next;
    });
  }, []);

  const handleReorder = useCallback(
    (newPages: PdfPage[]) => {
      setPages((prevPages) => {
        const selectedInstanceId = prevPages[selectedIdx]?.instanceId;
        if (selectedInstanceId) {
          const newIdx = newPages.findIndex(
            (p) => p.instanceId === selectedInstanceId,
          );
          setSelectedIdx(newIdx !== -1 ? newIdx : 0);
        }
        return newPages;
      });
    },
    [selectedIdx],
  );

  const handleSaveAsPdf = useCallback(async () => {
    if (pages.length === 0) return;
    setIsSaving(true);
    setError(null);
    try {
      const bytes = await exportFilteredPdf(sources, pages);
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: 'application/pdf',
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `edited-${sources[0]?.file.name ?? 'document.pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save PDF.');
    } finally {
      setIsSaving(false);
    }
  }, [sources, pages]);

  const selectedPage = pages[selectedIdx] ?? null;
  const selectedSource = selectedPage
    ? sourceMap.get(selectedPage.sourceId)
    : null;

  const fileLabel =
    sources.length === 1 ? sources[0].file.name : `${sources.length} files`;

  return (
    <div className="app">
      <header className="app__toolbar">
        <div className="app__toolbar-left">
          <PdfUploader
            onFileLoad={handleOpenPdf}
            label="Open PDF"
            disabled={isLoading}
          />
          {hasContent && (
            <PdfUploader
              onFileLoad={handleAddPdf}
              label="Add PDF"
              variant="secondary"
              disabled={isLoading}
            />
          )}
          {hasContent && (
            <span className="app__filename" title={fileLabel}>
              {fileLabel}
            </span>
          )}
          {isLoading && (
            <span className="app__loading" aria-live="polite">
              Loading…
            </span>
          )}
        </div>

        {hasContent && (
          <div className="app__toolbar-right">
            <ViewToggle mode={viewMode} onChange={setViewMode} />
            <span className="app__page-count">
              {pages.length} / {totalOriginal} pages
            </span>
            <button
              type="button"
              className="app__clear-btn"
              onClick={handleClear}
              disabled={isLoading || isSaving}
            >
              Clear
            </button>
            <button
              type="button"
              className="app__save-btn"
              onClick={() => void handleSaveAsPdf()}
              disabled={isSaving || pages.length === 0}
            >
              {isSaving ? 'Saving…' : 'Save as PDF'}
            </button>
          </div>
        )}
      </header>

      {error && (
        <div className="app__error" role="alert">
          {error}
        </div>
      )}

      {hasContent ? (
        viewMode === 'slide' ? (
          <div className="app__viewer">
            <ThumbnailSidebar
              sources={sourceMap}
              pages={pages}
              selectedIdx={selectedIdx}
              onSelect={setSelectedIdx}
              onDelete={handleDeletePage}
            />
            <main className="app__main">
              {selectedPage && selectedSource ? (
                <PagePreview
                  url={selectedSource.url}
                  pageNumber={selectedPage.pageNumber}
                />
              ) : (
                <div className="app__empty-state">All pages deleted.</div>
              )}
            </main>
          </div>
        ) : (
          <ThumbnailGrid
            sources={sourceMap}
            pages={pages}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
            onDelete={handleDeletePage}
            onReorder={handleReorder}
          />
        )
      ) : (
        <div className="app__welcome">
          <div className="app__welcome-content">
            <svg
              className="app__welcome-icon"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 8h24l12 12v36H16V8z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M40 8v12h12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <text
                x="32"
                y="42"
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="currentColor"
              >
                PDF
              </text>
            </svg>
            <h2>Open a PDF to get started</h2>
            <p>
              Select a PDF file to view its pages, remove unwanted pages, and
              save the result.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
