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
      <label className="flex cursor-pointer items-start justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-neutral-950">{title}</span>
          <span className="mt-1 block text-sm text-neutral-500">{description}</span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900"
          aria-label={title}
        />
      </label>
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
