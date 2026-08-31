import api from '@/lib/api';
import {
  DEFAULT_LANGUAGE_PROFICIENCY_LEVELS,
  type SpokenLanguageLevel,
} from '@/lib/spoken-languages';

export type LanguageProficiencyLevelOption = {
  code: SpokenLanguageLevel;
  label: string;
  sortOrder: number;
};

export async function fetchLanguageProficiencyLevels(): Promise<LanguageProficiencyLevelOption[]> {
  try {
    const res = await api.get<LanguageProficiencyLevelOption[]>(
      '/api/reference/language-proficiency-levels'
    );
    if (!Array.isArray(res.data) || res.data.length === 0) {
      return DEFAULT_LANGUAGE_PROFICIENCY_LEVELS;
    }
    return res.data
      .filter(
        (item): item is LanguageProficiencyLevelOption =>
          Boolean(item) &&
          typeof item.code === 'string' &&
          typeof item.label === 'string' &&
          typeof item.sortOrder === 'number'
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return DEFAULT_LANGUAGE_PROFICIENCY_LEVELS;
  }
}
