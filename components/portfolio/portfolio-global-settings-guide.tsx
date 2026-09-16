export type GlobalSettingsSubSection = 'theme' | 'background' | 'order';

export const GLOBAL_SETTINGS_SUB_SECTIONS: {
  id: GlobalSettingsSubSection;
  label: string;
  description: string;
}[] = [
  {
    id: 'theme',
    label: 'Foundations',
    description: 'Color palette, layout width, plus owner shortcuts.',
  },
  {
    id: 'background',
    label: 'Page background',
    description: 'Solid color or fixed wallpaper behind every section.',
  },
  {
    id: 'order',
    label: 'Section order',
    description: 'Reorder middle sections. Hero stays first, Footer last.',
  },
];
