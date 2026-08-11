type Props = {
  code: string;
};

export function RequestCodeBadge({ code }: Props) {
  return (
    <span className="inline-flex items-center rounded-md bg-neutral-100 px-2.5 py-1 font-mono text-xs font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
      {code}
    </span>
  );
}
