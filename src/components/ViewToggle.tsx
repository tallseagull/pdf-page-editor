import type { ViewMode } from '../types.ts';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="view-toggle" role="group" aria-label="View mode">
      <button
        type="button"
        className={`view-toggle__btn${mode === 'slide' ? ' view-toggle__btn--active' : ''}`}
        onClick={() => onChange('slide')}
        aria-pressed={mode === 'slide'}
        title="Slide view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="12" rx="1" fill="currentColor" opacity="0.7" />
          <rect x="9" y="2" width="5" height="12" rx="1" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        className={`view-toggle__btn${mode === 'thumbnail' ? ' view-toggle__btn--active' : ''}`}
        onClick={() => onChange('thumbnail')}
        aria-pressed={mode === 'thumbnail'}
        title="Thumbnail view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
