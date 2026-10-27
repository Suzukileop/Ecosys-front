import { isServiceIconChoice, type ServiceIconChoice } from './portfolio-services-icon-cards-icons';
import type { InfoBioCase } from './portfolio-info-bio';

export type PlatformHeadlineFormat = {
  bioFontFamily?: 'default' | 'serif' | 'sans';
  bioFontSize?: number;
  bioBold?: boolean;
  bioItalic?: boolean;
  bioCase?: InfoBioCase;
  bioLineHeight?: number;
};
export const DEFAULT_PLATFORM_HEADLINE_FORMAT: PlatformHeadlineFormat = {
  bioFontFamily: 'serif', bioBold: false, bioItalic: true, bioCase: 'original',
};
export function mergePlatformHeadlineFormat(value: unknown, base = DEFAULT_PLATFORM_HEADLINE_FORMAT): PlatformHeadlineFormat {
  const r = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    bioFontFamily: r.bioFontFamily === 'default' ? 'serif' : r.bioFontFamily === 'sans' || r.bioFontFamily === 'serif' ? r.bioFontFamily : base.bioFontFamily,
    bioFontSize: typeof r.bioFontSize === 'number' && Number.isFinite(r.bioFontSize) ? Math.max(12, Math.min(120, r.bioFontSize)) : undefined,
    bioBold: typeof r.bioBold === 'boolean' ? r.bioBold : base.bioBold,
    bioItalic: typeof r.bioItalic === 'boolean' ? r.bioItalic : base.bioItalic,
    bioCase: ['original','sentence','lowercase','uppercase','title'].includes(String(r.bioCase)) ? r.bioCase as InfoBioCase : base.bioCase,
    bioLineHeight: typeof r.bioLineHeight === 'number' && Number.isFinite(r.bioLineHeight) ? Math.max(1, Math.min(2.5, r.bioLineHeight)) : base.bioLineHeight,
  };
}
export function mergePlatformIcons(value: unknown, base: Record<string, ServiceIconChoice> = {}): Record<string, ServiceIconChoice> {
  const icons = { ...base };
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [id, choice] of Object.entries(value)) {
      if (id !== '__proto__' && id !== 'constructor' && id !== 'prototype' && isServiceIconChoice(choice)) icons[id] = choice;
    }
  }
  return icons;
}
