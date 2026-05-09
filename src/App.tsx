import { useCallback, useState } from 'react';
import './App.css';
import PagePreview from './components/PagePreview.tsx';
import PdfUploader from './components/PdfUploader.tsx';
import ThumbnailSidebar from './components/ThumbnailSidebar.tsx';
import { exportFilteredPdf } from './lib/pdfExport.ts';

export default function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [remainingPages, setRemainingPages] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleFileLoad = useCallback((file: File) => {
    setPdfFile(file);
    setPageCount(0);
    setRemainingPages([]);
    setSelectedIdx(0);
    setSaveError(null);
  }, []);

  const handleDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setPageCount(numPages);
      setRemainingPages(Array.from({ length: numPages }, (_, i) => i + 1));
      setSelectedIdx(0);
    },
    [],
  );

  const handleDeletePage = useCallback(
    (idxToDelete: number) => {
      setRemainingPages((prev) => {
        const next = prev.filter((_, i) => i !== idxToDelete);
        setSelectedIdx((sel) => {
          if (next.length === 0) return 0;
          if (idxToDelete < sel) return sel - 1;
          if (idxToDelete === sel)
            return Math.min(sel, next.length - 1);
          return sel;
        });
        return next;
      });
    },
    [],
  );

  const handleSaveAsPdf = useCallback(async () => {
    if (!pdfFile || remainingPages.length === 0) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const bytes = await exportFilteredPdf(pdfFile, remainingPages);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-${pdfFile.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save PDF.');
    } finally {
      setIsSaving(false);
    }
  }, [pdfFile, remainingPages]);

  const selectedPageNumber =
    remainingPages.length > 0 ? remainingPages[selectedIdx] : null;

  return (
    <div className="app">
      <header className="app__toolbar">
        <div className="app__toolbar-left">
          <PdfUploader onFileLoad={handleFileLoad} />
          {pdfFile && (
            <span className="app__filename" title={pdfFile.name}>
              {pdfFile.name}
            </span>
          )}
        </div>

        {pdfFile && pageCount > 0 && (
          <div className="app__toolbar-right">
            <span className="app__page-count">
              {remainingPages.length} / {pageCount} pages
            </span>
            <button
              type="button"
              className="app__save-btn"
              onClick={() => void handleSaveAsPdf()}
              disabled={isSaving || remainingPages.length === 0}
            >
              {isSaving ? 'Saving…' : 'Save as PDF'}
            </button>
          </div>
        )}
      </header>

      {saveError && (
        <div className="app__error" role="alert">
          {saveError}
        </div>
      )}

      {pdfFile ? (
        <div className="app__viewer">
          <ThumbnailSidebar
            file={pdfFile}
            remainingPages={remainingPages}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
            onDelete={handleDeletePage}
            onDocumentLoadSuccess={handleDocumentLoadSuccess}
          />
          <main className="app__main">
            {selectedPageNumber !== null ? (
              <PagePreview file={pdfFile} pageNumber={selectedPageNumber} />
            ) : (
              <div className="app__empty-state">All pages deleted.</div>
            )}
          </main>
        </div>
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
