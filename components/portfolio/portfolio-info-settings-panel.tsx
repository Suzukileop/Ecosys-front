'use client';

import { useState } from 'react';
import {
  DEFAULT_INFO_SUBTITLE,
  DEFAULT_INFO_TITLE,
  defaultsForInfoDesign,
  PORTFOLIO_INFO_ABOUT_ME_TRAIT_HEADLINE_PRESETS,
  PORTFOLIO_INFO_ABOUT_MANIFESTO_BLOCKS_LAYOUT_OPTIONS,
  PORTFOLIO_INFO_ABOUT_MANIFESTO_PORTRAIT_FRAME_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_BLOCKS_LAYOUT_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_VALUES_LAYOUT_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_BIO_ALIGN_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_BIO_COLOR_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_BIO_SIZE_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_BIO_WIDTH_OPTIONS,
  PORTFOLIO_INFO_CONTENT_SIZE_OPTIONS,
  PORTFOLIO_INFO_DESIGN_OPTIONS,
  PORTFOLIO_INFO_EDUCATION_DISPLAY_OPTIONS,
  PORTFOLIO_INFO_LANGUAGE_LEVEL_DISPLAY_OPTIONS,
  type PortfolioInfoAboutValueBioAlign,
  type PortfolioInfoAboutValueBioColorToken,
  type PortfolioInfoAboutValueBioSize,
  type PortfolioInfoAboutValueBioWidth,
  type PortfolioInfoAboutManifestoBlocksLayout,
  type PortfolioInfoAboutManifestoPortraitFrame,
  type PortfolioInfoAboutValueBlocksLayout,
  type PortfolioInfoAboutValueValuesLayout,
  type PortfolioInfoAboutValueListMarkerStyle,
  type PortfolioInfoContentSize,
  type PortfolioInfoDesign,
  type PortfolioInfoEducationDisplayStyle,
  type PortfolioInfoLanguageLevelDisplayStyle,
  type PortfolioInfoSectionSettings,
} from '@/components/portfolio/portfolio-info-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';
import { applyHeroPaletteToInfo } from '@/components/portfolio/portfolio-section-palette';
import {
  resolveHeroPaletteColor,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';

export type InfoSubSection = 'general' | 'design';

const INFO_SUB_SECTIONS: { id: InfoSubSection; label: string; description: string }[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Visibilité, titre, sous-titre et affichage du niveau de langue.',
  },
  {
    id: 'design',
    label: 'Design',
    description: 'Disposition About me, blocs affichés, couleurs et fond.',
  },
];

export function normalizeInfoSubSection(value: string | undefined): InfoSubSection {
  return value === 'design' ? 'design' : 'general';
}

function InfoContentSizePicker({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: PortfolioInfoContentSize;
  onChange: (value: PortfolioInfoContentSize) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {PORTFOLIO_INFO_CONTENT_SIZE_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              title={option.description}
              onClick={() => onChange(option.value)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-900">{label}</span>
        {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-neutral-950"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const hex = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#e2572e';
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
        />
      </div>
    </label>
  );
}

export function InfoSettingsPanel({
  info,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  heroPalette,
}: {
  info: PortfolioInfoSectionSettings;
  onChange: (patch: Partial<PortfolioInfoSectionSettings>) => void;
  subSection?: InfoSubSection;
  onSubSectionChange?: (value: InfoSubSection) => void;
  heroPalette?: PortfolioHeroPalette;
}) {
  const [uncontrolled, setUncontrolled] = useState<InfoSubSection>('general');
  const subSection = normalizeInfoSubSection(controlledSubSection ?? uncontrolled);
  const setSubSection = (value: InfoSubSection) => {
    const next = normalizeInfoSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection == null) setUncontrolled(next);
  };
  const activeMeta =
    INFO_SUB_SECTIONS.find((section) => section.id === subSection) ?? INFO_SUB_SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Info subsection
          </p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as InfoSubSection)}
          className="w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:min-w-[12rem] sm:max-w-xs sm:flex-1"
        >
          {INFO_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-6">
          <Toggle
            label="Afficher la section Info"
            description="Section placée sous le Hero sur le portfolio public."
            checked={info.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Titre</p>
            <input
              type="text"
              value={info.title}
              placeholder={DEFAULT_INFO_TITLE}
              onChange={(event) => onChange({ title: event.target.value })}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
            />
            <p className="mt-1 text-sm text-neutral-500">
              Affiché en label (ex. ABOUT ME) au-dessus du sous-titre.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Sous-titre
            </p>
            <input
              type="text"
              value={info.subtitle}
              placeholder={DEFAULT_INFO_SUBTITLE}
              onChange={(event) => onChange({ subtitle: event.target.value })}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
            />
            <p className="mt-1 text-sm text-neutral-500">
              Grande accroche sous le titre (ex. Background, education and how I work.).
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Affichage du niveau de langue
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Comment le niveau (Beginner → Expert) apparaît à côté de chaque langue.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PORTFOLIO_INFO_LANGUAGE_LEVEL_DISPLAY_OPTIONS.map((option) => {
                const active =
                  (info.languageLevelDisplayStyle ?? 'stars') === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      onChange({
                        languageLevelDisplayStyle:
                          option.value as PortfolioInfoLanguageLevelDisplayStyle,
                      })
                    }
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-neutral-950">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm text-neutral-500">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <Toggle
              label="Drapeaux des langues"
              description="Affiche le drapeau à côté de chaque langue dans la section Info."
              checked={info.showLanguageFlags !== false}
              onChange={(showLanguageFlags) => onChange({ showLanguageFlags })}
            />
          </div>
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm text-neutral-600">
            Le contenu (bio, éducation, skills…) vient de Creator Studio → Information / About.
          </p>
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Design Info
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-1">
              {PORTFOLIO_INFO_DESIGN_OPTIONS.map((option) => {
                const active = (info.design ?? 'about-me') === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      onChange(defaultsForInfoDesign(option.value as PortfolioInfoDesign))
                    }
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-neutral-950">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm text-neutral-500">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <InfoContentSizePicker
            label="Taille des éléments"
            description="Labels, listes, titres de blocs, education et contenu — tous les designs Info."
            value={info.contentSize ?? info.aboutManifestoContentSize ?? info.aboutMeTraitContentSize ?? 'md'}
            onChange={(contentSize) => onChange({ contentSize })}
          />

          {(info.design ?? 'about-me') === 'about-value' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Affichage des values
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                About · value — éditorial, grille numérotée ou liste indexée (001 · titre · texte).
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {PORTFOLIO_INFO_ABOUT_VALUE_VALUES_LAYOUT_OPTIONS.map((option) => {
                  const active =
                    (info.aboutValueValuesLayout ?? 'editorial') === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        onChange({
                          aboutValueValuesLayout:
                            option.value as PortfolioInfoAboutValueValuesLayout,
                        })
                      }
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-neutral-950">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-sm text-neutral-500">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-value' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Disposition des blocs
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                About · value — split (titre à gauche) ou grille 2 colonnes pour Strengths,
                Languages, etc.
                {(info.aboutValueValuesLayout ?? 'editorial') === 'numbered-grid' ||
                (info.aboutValueValuesLayout ?? 'editorial') === 'indexed-list'
                  ? ' L’affichage alternatif des skills remplace la liste éditoriale.'
                  : ''}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {PORTFOLIO_INFO_ABOUT_VALUE_BLOCKS_LAYOUT_OPTIONS.map((option) => {
                  const active =
                    (info.aboutValueBlocksLayout ?? 'split') === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        onChange({
                          aboutValueBlocksLayout:
                            option.value as PortfolioInfoAboutValueBlocksLayout,
                        })
                      }
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-neutral-950">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-sm text-neutral-500">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-value' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Puces de liste
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Style des marqueurs pour My Values, Strengths, Languages (sans drapeau), Education,
                etc.
              </p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS.map((option) => {
                  const active =
                    (info.aboutValueListMarkerStyle ?? 'dot') === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      title={`${option.label} — ${option.description}`}
                      onClick={() =>
                        onChange({
                          aboutValueListMarkerStyle:
                            option.value as PortfolioInfoAboutValueListMarkerStyle,
                        })
                      }
                      className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-base font-semibold leading-none text-neutral-900">
                        {option.preview}
                      </span>
                      <span className="max-w-full truncate text-[10px] font-medium text-neutral-500">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-manifesto' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Disposition des blocs
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  About · manifesto — grille 2 colonnes ou un bloc par ligne en zigzag.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PORTFOLIO_INFO_ABOUT_MANIFESTO_BLOCKS_LAYOUT_OPTIONS.map((option) => {
                    const active =
                      (info.aboutManifestoBlocksLayout ?? 'grid') === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          onChange({
                            aboutManifestoBlocksLayout:
                              option.value as PortfolioInfoAboutManifestoBlocksLayout,
                          })
                        }
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <span className="block text-sm font-semibold text-neutral-950">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-sm text-neutral-500">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
                <Toggle
                  label="Focus au scroll"
                  checked={info.aboutManifestoBlocksScrollFocus === true}
                  onChange={(aboutManifestoBlocksScrollFocus) =>
                    onChange({ aboutManifestoBlocksScrollFocus })
                  }
                />
                <p className="mt-2 text-sm text-neutral-500">
                  Floute légèrement les blocs hors centre — le bloc au milieu de l&apos;écran reste
                  net pendant le défilement.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Cadre du portrait
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Forme de la photo de profil — colonne droite du manifesto (grand écran).
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PORTFOLIO_INFO_ABOUT_MANIFESTO_PORTRAIT_FRAME_OPTIONS.map((option) => {
                    const active =
                      (info.aboutManifestoPortraitFrame ?? 'circle') === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          onChange({
                            aboutManifestoPortraitFrame:
                              option.value as PortfolioInfoAboutManifestoPortraitFrame,
                          })
                        }
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <span className="block text-sm font-semibold text-neutral-950">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs text-neutral-500">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
                <Toggle
                  label="Portrait noir & blanc"
                  checked={info.aboutManifestoAvatarGrayscale === true}
                  onChange={(aboutManifestoAvatarGrayscale) =>
                    onChange({ aboutManifestoAvatarGrayscale })
                  }
                />
                <p className="mt-2 text-sm text-neutral-500">
                  Applique un filtre grayscale sur la photo de profil (grand écran).
                </p>
              </div>
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-value-steps' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Intro éditoriale
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Deux paragraphes au-dessus de la liste numérotée — séparés par un trait fin.
                </p>
              </div>
              <Toggle
                label="Afficher l'intro"
                checked={info.aboutValueStepsIntroEnabled !== false}
                onChange={(aboutValueStepsIntroEnabled) =>
                  onChange({ aboutValueStepsIntroEnabled })
                }
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Paragraphe 1
                </p>
                <textarea
                  value={info.aboutValueStepsIntroParagraph1 ?? ''}
                  placeholder="Texte d'introduction — paragraphe 1."
                  onChange={(event) =>
                    onChange({ aboutValueStepsIntroParagraph1: event.target.value })
                  }
                  rows={3}
                  className="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-neutral-900"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Paragraphe 2
                </p>
                <textarea
                  value={info.aboutValueStepsIntroParagraph2 ?? ''}
                  placeholder="Texte d'introduction — paragraphe 2."
                  onChange={(event) =>
                    onChange({ aboutValueStepsIntroParagraph2: event.target.value })
                  }
                  rows={3}
                  className="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-neutral-900"
                />
              </div>
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-value' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Bio description
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Statement éditorial au-dessus des blocs My Values — texte, taille, largeur et
                  couleur.
                </p>
              </div>
              <Toggle
                label="Afficher la bio"
                checked={info.aboutValueBioEnabled !== false}
                onChange={(aboutValueBioEnabled) => onChange({ aboutValueBioEnabled })}
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Texte personnalisé
                </p>
                <textarea
                  value={info.aboutValueBioCustomText ?? ''}
                  placeholder="Laisser vide pour utiliser la bio du profil (Creator Studio → Information)."
                  onChange={(event) => onChange({ aboutValueBioCustomText: event.target.value })}
                  rows={3}
                  className="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-neutral-900"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Taille
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {PORTFOLIO_INFO_ABOUT_VALUE_BIO_SIZE_OPTIONS.map((option) => {
                    const active = (info.aboutValueBioSize ?? 'xl') === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        title={option.description}
                        onClick={() =>
                          onChange({ aboutValueBioSize: option.value as PortfolioInfoAboutValueBioSize })
                        }
                        className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                          active
                            ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Largeur
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PORTFOLIO_INFO_ABOUT_VALUE_BIO_WIDTH_OPTIONS.map((option) => {
                    const active = (info.aboutValueBioWidth ?? 'full') === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          onChange({ aboutValueBioWidth: option.value as PortfolioInfoAboutValueBioWidth })
                        }
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <span className="block text-sm font-semibold text-neutral-950">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs text-neutral-500">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {(info.aboutValueBioWidth ?? 'full') === 'half' ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Alignement (demi largeur)
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {PORTFOLIO_INFO_ABOUT_VALUE_BIO_ALIGN_OPTIONS.map((option) => {
                      const active = (info.aboutValueBioAlign ?? 'left') === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            onChange({
                              aboutValueBioAlign: option.value as PortfolioInfoAboutValueBioAlign,
                            })
                          }
                          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                            active
                              ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                              : 'border-neutral-200 bg-white hover:border-neutral-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Couleur (token palette)
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PORTFOLIO_INFO_ABOUT_VALUE_BIO_COLOR_OPTIONS.map((option) => {
                    const active =
                      (info.aboutValueBioColorToken ?? 'texteMuted') === option.value;
                    const swatch = heroPalette
                      ? resolveHeroPaletteColor(heroPalette, option.value)
                      : '#94A3B8';
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          onChange({
                            aboutValueBioColorToken:
                              option.value as PortfolioInfoAboutValueBioColorToken,
                          })
                        }
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                            style={{ backgroundColor: swatch }}
                            aria-hidden
                          />
                          <span className="text-sm font-semibold text-neutral-950">
                            {option.label}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-neutral-500">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <SectionHeroPaletteToggle
            enabled={info.useHeroPalette !== false}
            onChange={(useHeroPalette) =>
              onChange(
                useHeroPalette && heroPalette
                  ? applyHeroPaletteToInfo({ ...info, useHeroPalette: true }, heroPalette)
                  : { useHeroPalette }
              )
            }
          />

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Blocs affichés
            </p>
            <Toggle
              label="Education"
              checked={
                (info.design ?? 'about-me') === 'about-value' ||
                (info.design ?? 'about-me') === 'about-value-steps' ||
                (info.design ?? 'about-me') === 'about-manifesto'
                  ? info.showEducation === true
                  : info.showEducation !== false
              }
              onChange={(showEducation) => onChange({ showEducation })}
            />
            {(info.design ?? 'about-me') === 'about-me-trait' ? (
              <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Grand titre
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Texte éditorial à droite du portrait — remplace la bio. Utilisez des retours à
                    la ligne pour créer plusieurs lignes.
                  </p>
                </div>
                <Toggle
                  label="Afficher le grand titre"
                  checked={info.aboutMeTraitHeadlineEnabled !== false}
                  onChange={(aboutMeTraitHeadlineEnabled) =>
                    onChange({ aboutMeTraitHeadlineEnabled })
                  }
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Phrases introductives
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Variations éditoriales en 3 lignes — cliquez pour appliquer.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {PORTFOLIO_INFO_ABOUT_ME_TRAIT_HEADLINE_PRESETS.map((preset) => {
                      const active =
                        (info.aboutMeTraitHeadlineCustomText ?? '').trim() === preset.text;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => onChange({ aboutMeTraitHeadlineCustomText: preset.text })}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            active
                              ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                              : 'border-neutral-200 bg-white hover:border-neutral-300'
                          }`}
                        >
                          <span className="block text-sm font-semibold text-neutral-950">
                            {preset.label}
                          </span>
                          <span className="mt-1 block whitespace-pre-line text-xs leading-snug text-neutral-500">
                            {preset.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Texte personnalisé
                  </p>
                  <textarea
                    value={info.aboutMeTraitHeadlineCustomText ?? ''}
                    placeholder={'Turning Hard\nProblems Into\nSimple Software'}
                    onChange={(event) =>
                      onChange({ aboutMeTraitHeadlineCustomText: event.target.value })
                    }
                    rows={4}
                    className="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-neutral-900"
                  />
                </div>
              </div>

            </div>
          ) : null}

            {(info.design ?? 'about-me') === 'about-me-trait' && info.showEducation !== false ? (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Design Education
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  4 présentations type Awwwards / Webflow / Framer (About me · trait).
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PORTFOLIO_INFO_EDUCATION_DISPLAY_OPTIONS.map((option) => {
                    const active =
                      (info.educationDisplayStyle ?? 'editorial') === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          onChange({
                            educationDisplayStyle:
                              option.value as PortfolioInfoEducationDisplayStyle,
                          })
                        }
                        className={`rounded-2xl border px-3.5 py-3 text-left transition ${
                          active
                            ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <span className="block text-sm font-semibold text-neutral-950">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs text-neutral-500">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {(info.educationDisplayStyle ?? 'editorial') === 'cascade' ? (
                  <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
                    <Toggle
                      label="Animation cascade au scroll"
                      checked={info.educationCascadeScrollShift === true}
                      onChange={(educationCascadeScrollShift) =>
                        onChange({ educationCascadeScrollShift })
                      }
                    />
                    {info.educationCascadeScrollShift === true ? (
                      <p className="text-sm text-neutral-500">
                        Les items partent alignés comme le premier, puis se décalent fluidement au
                        défilement.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
            <Toggle
              label="Skills"
              checked={info.showSkills !== false}
              onChange={(showSkills) => onChange({ showSkills })}
            />
            <Toggle
              label="Strengths"
              checked={
                (info.design ?? 'about-me') === 'about-value-steps'
                  ? info.showStrengths === true
                  : info.showStrengths !== false
              }
              onChange={(showStrengths) => onChange({ showStrengths })}
            />
            <Toggle
              label="Interests"
              checked={
                (info.design ?? 'about-me') === 'about-value'
                  ? info.showInterests === true
                  : info.showInterests !== false
              }
              onChange={(showInterests) => onChange({ showInterests })}
            />
            <Toggle
              label="Languages"
              checked={
                (info.design ?? 'about-me') === 'about-value-steps'
                  ? info.showLanguages === true
                  : info.showLanguages !== false
              }
              onChange={(showLanguages) => onChange({ showLanguages })}
            />
            <Toggle
              label="Systems & tools"
              checked={
                (info.design ?? 'about-me') === 'about-value' ||
                (info.design ?? 'about-me') === 'about-value-steps'
                  ? info.showSystemsTools === true
                  : info.showSystemsTools !== false
              }
              onChange={(showSystemsTools) => onChange({ showSystemsTools })}
            />
          </div>

          {info.useHeroPalette === false ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Accent (labels / puces)"
                value={info.accentColor}
                onChange={(accentColor) => onChange({ accentColor })}
              />
              <ColorField
                label="Titre (label)"
                value={info.titleColor}
                onChange={(titleColor) => onChange({ titleColor })}
              />
              <ColorField
                label="Sous-titre"
                value={info.subtitleColor}
                onChange={(subtitleColor) => onChange({ subtitleColor })}
              />
              <ColorField
                label="Corps / listes"
                value={info.bodyColor}
                onChange={(bodyColor) => onChange({ bodyColor })}
              />
              <ColorField
                label="Fond carte"
                value={info.cardBackgroundColor}
                onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
              />
              <ColorField
                label="Bordure carte"
                value={info.cardBorderColor}
                onChange={(cardBorderColor) => onChange({ cardBorderColor })}
              />
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm text-neutral-600">
              Couleurs liées à la palette Hero (principal = accents, fond = cartes).
            </p>
          )}

          <SectionBackgroundSettingsFields
            settings={info}
            onChange={(patch) => onChange(patch)}
            title="Fond de section Info"
          />
        </div>
      ) : null}
    </div>
  );
}
