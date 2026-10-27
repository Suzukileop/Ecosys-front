'use client';

import { createContext } from 'react';

export const BackgroundSwatchesContext = createContext(false);

type Swatch = { value: string; label: string; color: string; auto?: boolean };
const ROLES = [
  { token: 'fond', labels: ['Background', 'Fond'] },
  { token: 'neutre', labels: ['Neutral', 'Surface', 'Neutre'] },
  { token: 'principal', labels: ['Primary', 'Principal'] },
  { token: 'secondaire', labels: ['Secondary', 'Secondaire'] },
  { token: 'texteFort', labels: ['Strong text', 'Texte fort'] },
];

function colorKey(color: string) {
  const value = color.trim().toLowerCase();
  return /^#[\da-f]{3}$/i.test(value) ? value.replace(/[\da-f]/gi, digit => digit + digit) : value;
}

/** Keep semantic ordering and one swatch per visible color, without changing saved bindings. */
export function organizeBackgroundSwatches(options: readonly Swatch[], value: string, translate: (text: string) => string) {
  const ordered = ROLES.flatMap(role => {
    const option = options.find(option => option.value === role.token || role.labels.some(label => option.label === label || option.label === translate(label)));
    return option ? [{ ...option, label: translate(role.token === 'neutre' ? 'Surface' : option.label) }] : [];
  });
  const candidates = ordered.length ? ordered : options;
  const grouped: Swatch[] = [];
  for (const option of candidates) {
    const existing = grouped.find(item => colorKey(item.color) === colorKey(option.color) && item.auto === option.auto);
    if (existing) {
      if (!existing.label.split(' / ').includes(option.label)) existing.label += ` / ${option.label}`;
    } else grouped.push({ ...option });
  }
  const selected = options.find(option => option.value === value);
  const active = grouped.find(option => option.value === value || (selected && colorKey(option.color) === colorKey(selected.color)));
  return { options: grouped, value: active?.value ?? value };
}
