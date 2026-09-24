/** Per-design "Layout settings" store shared by sections that use the registry pattern
 *  (Contact; Footer predates it with its own copy in portfolio-footer-settings.ts). An absent
 *  field always means "use the design's default", so an empty store renders like before. */
export type DesignLayoutElementOverride = {
  visible?: boolean;
  text?: string;
  choice?: string;
};

export type DesignLayout = {
  elements?: Record<string, DesignLayoutElementOverride>;
};

const KEY_MAX = 40;
const TEXT_MAX = 600;

export function normalizeDesignLayouts<K extends string>(
  value: unknown,
  allowedDesigns: readonly K[]
): Partial<Record<K, DesignLayout>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const allowed = new Set<string>(allowedDesigns);
  const result: Partial<Record<K, DesignLayout>> = {};

  for (const [design, rawLayout] of Object.entries(value as Record<string, unknown>)) {
    if (!allowed.has(design) || !rawLayout || typeof rawLayout !== 'object') continue;
    const rawElements = (rawLayout as Record<string, unknown>).elements;
    if (!rawElements || typeof rawElements !== 'object') continue;

    const elements: Record<string, DesignLayoutElementOverride> = {};
    for (const [key, rawOverride] of Object.entries(rawElements as Record<string, unknown>)) {
      if (key.length > KEY_MAX || !rawOverride || typeof rawOverride !== 'object') continue;
      const record = rawOverride as Record<string, unknown>;
      const override: DesignLayoutElementOverride = {};
      if (typeof record.visible === 'boolean') override.visible = record.visible;
      if (typeof record.text === 'string') override.text = record.text.slice(0, TEXT_MAX);
      if (typeof record.choice === 'string' && record.choice.length > 0 && record.choice.length <= KEY_MAX) {
        override.choice = record.choice;
      }
      if (Object.keys(override).length > 0) elements[key] = override;
    }
    if (Object.keys(elements).length > 0) result[design as K] = { elements };
  }

  return result;
}
