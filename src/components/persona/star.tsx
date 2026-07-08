/** Four-point P5 spark. Inherits currentColor. */
export default function Star({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0c.9 6.5 4.6 10.6 12 12-7.4 1.4-11.1 5.5-12 12-.9-6.5-4.6-10.6-12-12C7.4 10.6 11.1 6.5 12 0Z" />
    </svg>
  );
}
