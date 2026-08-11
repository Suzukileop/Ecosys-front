'use client';

type ProductSubtitlesListProps = {
  subtitles: string[];
  className?: string;
};

export function ProductSubtitlesList({ subtitles, className = '' }: ProductSubtitlesListProps) {
  const items = subtitles.map((item) => item.trim()).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <div className={`space-y-2 text-center ${className}`}>
      {items.map((subtitle, index) => (
        <p
          key={`${index}-${subtitle.slice(0, 24)}`}
          className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
        >
          {subtitle}
        </p>
      ))}
    </div>
  );
}
