type DiscussionThreadLoadingBarProps = {
  active: boolean;
};

export function DiscussionThreadLoadingBar({ active }: DiscussionThreadLoadingBarProps) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-3 top-0 z-10 h-px overflow-hidden rounded-full bg-neutral-200/50 dark:bg-neutral-800/80"
      aria-hidden
    >
      <div className="discussion-thread-loading-bar h-full w-2/5 rounded-full bg-[#F97316]" />
    </div>
  );
}
