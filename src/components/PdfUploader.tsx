import { useRef } from 'react';

interface PdfUploaderProps {
  onFileLoad: (file: File) => void;
  label?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function PdfUploader({
  onFileLoad,
  label = 'Open PDF',
  variant = 'primary',
  disabled = false,
}: PdfUploaderProps) {
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
    <label
      className={`uploader${disabled ? ' uploader--disabled' : ''}`}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="uploader__input"
        aria-label={label}
        disabled={disabled}
      />
      <span
        className={`uploader__btn uploader__btn--${variant}`}
      >
        {label}
      </span>
    </label>
  );
}
