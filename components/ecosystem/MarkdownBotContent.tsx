'use client';

import ReactMarkdown from 'react-markdown';

type Props = {
  text: string;
  className?: string;
};

/**
 * Rendu des réponses bot (souvent du markdown léger : listes, **gras**, liens).
 */
export function MarkdownBotContent({ text, className = '' }: Props) {
  return (
    <div className={`text-inherit [&_a]:break-all [&_a]:text-indigo-600 [&_a]:underline ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="leading-snug">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => <p className="mb-2 mt-1 text-base font-semibold">{children}</p>,
          h2: ({ children }) => <p className="mb-2 mt-1 text-sm font-semibold">{children}</p>,
          h3: ({ children }) => <p className="mb-1 mt-1 text-sm font-semibold">{children}</p>,
          code: ({ children }) => (
            <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium underline">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
