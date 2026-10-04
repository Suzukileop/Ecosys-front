interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const dotClasses = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
};

const gapClasses = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
};

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${gapClasses[size]}`} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className={`app-loader-dot rounded-full bg-current ${dotClasses[size]}`}
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  );
}

/** Full-viewport loader: orange progress line pinned to the top, dots centred on the page ground. */
export function AppLoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white text-[#111111] dark:bg-neutral-950 dark:text-white">
      <div className="fixed inset-x-0 top-0 h-0.5 overflow-hidden bg-black/[0.04] dark:bg-white/[0.06]" aria-hidden>
        <div className="app-loader-bar h-full w-2/5 rounded-full bg-[#FF5722]" />
      </div>
      <LoadingSpinner size="lg" />
    </div>
  );
}
