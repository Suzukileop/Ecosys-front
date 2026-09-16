/** Toggle that links section colors to the Global site palette (dark/light pair). */
export function SectionHeroPaletteToggle({
  enabled,
  onChange,
  title = 'Use global color palette',
  description = 'Sync this section with the Global site palette (Principal, Texte fort, Fond, Bordure…). Turn off to keep this section’s own colors.',
  enabledHint = 'Colors follow Global → Theme. Edit the dark/light token pair there. Section color pickers are ignored while this is on.',
  disabledHint,
}: {
  enabled: boolean;
  onChange: (useHeroPalette: boolean) => void;
  title?: string;
  description?: string;
  enabledHint?: string;
  /** Shown when the palette is off (manual mode). */
  disabledHint?: string;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
      <div className="flex items-start justify-between gap-4">
        <span className="min-w-0">
          <span
            className="block cursor-pointer text-sm font-semibold text-neutral-950"
            onClick={() => onChange(!enabled)}
          >
            {title}
          </span>
          <span className="mt-1 block text-sm text-neutral-500">{description}</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={title}
          onClick={() => onChange(!enabled)}
          className="mt-1 shrink-0"
        >
          <span
            data-checked={enabled ? 'true' : 'false'}
            className="pf-global-switch-track relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <span
              data-checked={enabled ? 'true' : 'false'}
              className="pf-global-switch-thumb absolute top-0.5 h-4 w-4 rounded-full transition-[left,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: enabled ? '1.125rem' : '0.125rem' }}
            />
          </span>
        </button>
      </div>
      {enabled && enabledHint ? (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-500">
          {enabledHint}
        </p>
      ) : null}
      {!enabled && disabledHint ? (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-500">
          {disabledHint}
        </p>
      ) : null}
    </div>
  );
}
