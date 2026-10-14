import { msg } from '@/lib/i18n/config';
export type GlobalSettingsSubSection = 'theme' | 'background' | 'order';

export const GLOBAL_SETTINGS_SUB_SECTIONS: {
  id: GlobalSettingsSubSection;
  label: string;
  description: string;
}[] = [
  {
    id: 'theme',
    label: msg('Foundations'),
    description: msg('Color palette, layout width, plus owner shortcuts.'),
  },
  {
    id: 'background',
    label: msg('Page background'),
    description: msg('Solid color or fixed wallpaper behind every section.'),
  },
  {
    id: 'order',
    label: msg('Section order'),
    description: msg('Reorder middle sections. Hero stays first, Footer last.'),
  },
];
