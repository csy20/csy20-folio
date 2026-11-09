export function ScrollProgress() {
  return (
    <div
      aria-hidden="true"
      className="scroll-progress-bar pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[var(--accent)]"
    />
  );
}
