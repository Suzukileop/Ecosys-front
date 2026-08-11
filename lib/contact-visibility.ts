export type ContactVisibilityLevel = 'PUBLIC' | 'MEMBERS' | 'HIDDEN';

export type ContactVisibilitySettings = {
  website: ContactVisibilityLevel;
  email: ContactVisibilityLevel;
  phone: ContactVisibilityLevel;
  availability: ContactVisibilityLevel;
  address: ContactVisibilityLevel;
  social: ContactVisibilityLevel;
  languages: ContactVisibilityLevel;
  cta: ContactVisibilityLevel;
  whyMe: ContactVisibilityLevel;
  experience: ContactVisibilityLevel;
  yearsOfExperience: ContactVisibilityLevel;
  strengthsTools: ContactVisibilityLevel;
  services: ContactVisibilityLevel;
  faq: ContactVisibilityLevel;
  links: ContactVisibilityLevel;
  gender: ContactVisibilityLevel;
  spokenLanguages: ContactVisibilityLevel;
  responseTime: ContactVisibilityLevel;
  team: ContactVisibilityLevel;
  gallery: ContactVisibilityLevel;
  portfolio: ContactVisibilityLevel;
  location: ContactVisibilityLevel;
  reputation: ContactVisibilityLevel;
};

export const DEFAULT_CONTACT_VISIBILITY: ContactVisibilitySettings = {
  website: 'PUBLIC',
  email: 'MEMBERS',
  phone: 'MEMBERS',
  availability: 'PUBLIC',
  address: 'HIDDEN',
  social: 'PUBLIC',
  languages: 'PUBLIC',
  cta: 'PUBLIC',
  whyMe: 'PUBLIC',
  experience: 'PUBLIC',
  yearsOfExperience: 'PUBLIC',
  strengthsTools: 'PUBLIC',
  services: 'PUBLIC',
  faq: 'PUBLIC',
  links: 'PUBLIC',
  gender: 'PUBLIC',
  spokenLanguages: 'PUBLIC',
  responseTime: 'PUBLIC',
  team: 'PUBLIC',
  gallery: 'PUBLIC',
  portfolio: 'PUBLIC',
  location: 'PUBLIC',
  reputation: 'PUBLIC',
};

export const CONTACT_VISIBILITY_OPTIONS: { value: ContactVisibilityLevel; label: string }[] = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'MEMBERS', label: 'Members only' },
  { value: 'HIDDEN', label: 'Hidden' },
];

export function parseContactVisibility(raw: unknown): ContactVisibilitySettings {
  if (!raw || typeof raw !== 'object') {
    if (typeof raw === 'string') {
      try {
        return parseContactVisibility(JSON.parse(raw));
      } catch {
        return { ...DEFAULT_CONTACT_VISIBILITY };
      }
    }
    return { ...DEFAULT_CONTACT_VISIBILITY };
  }
  const record = raw as Record<string, unknown>;
  const level = (key: keyof ContactVisibilitySettings, legacyKey?: string): ContactVisibilityLevel => {
    const rawValue = record[key] ?? (legacyKey ? record[legacyKey] : undefined) ?? DEFAULT_CONTACT_VISIBILITY[key];
    const value = String(rawValue).toUpperCase();
    if (value === 'PUBLIC' || value === 'MEMBERS' || value === 'HIDDEN') return value;
    return DEFAULT_CONTACT_VISIBILITY[key];
  };
  return {
    website: level('website'),
    email: level('email'),
    phone: level('phone'),
    availability: level('availability'),
    address: level('address'),
    social: level('social'),
    languages: level('languages'),
    cta: level('cta'),
    whyMe: level('whyMe'),
    experience: level('experience'),
    yearsOfExperience: level('yearsOfExperience'),
    strengthsTools: level('strengthsTools'),
    services: level('services'),
    faq: level('faq'),
    links: level('links'),
    gender: level('gender', 'pronouns'),
    spokenLanguages: level('spokenLanguages'),
    responseTime: level('responseTime'),
    team: level('team'),
    gallery: level('gallery'),
    portfolio: level('portfolio'),
    location: level('location'),
    reputation: level('reputation'),
  };
}
