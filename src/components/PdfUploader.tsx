import { useRef } from 'react';

interface PdfUploaderProps {
  onFileLoad: (file: File) => void;
}

export default function PdfUploader({ onFileLoad }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFileLoad(file);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <label className="uploader">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="uploader__input"
        aria-label="Open PDF file"
      />
      <span className="uploader__btn">Open PDF</span>
    </label>
  );
}
