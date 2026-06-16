"use client";

interface Props {
  active: boolean;
  onToggle: () => void;
  label?: string;
}

export function StarToggle({ active, onToggle, label = "Toggle memorable" }: Props) {
  return (
    <button
      type="button"
      className={`star-toggle ${active ? "star-toggle--active" : ""}`}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={active}
    >
      {active ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
    </button>
  );
}
