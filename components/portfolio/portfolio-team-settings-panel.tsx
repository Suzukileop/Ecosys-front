'use client';

import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';
import {
  PORTFOLIO_TEAM_CARD_BORDER_OPTIONS,
  PORTFOLIO_TEAM_GAP_OPTIONS,
  PORTFOLIO_TEAM_ILLUSTRATION_OPTIONS,
  PORTFOLIO_TEAM_ILLUSTRATION_PLACEMENT_OPTIONS,
  PORTFOLIO_TEAM_LAYOUT_OPTIONS,
  PORTFOLIO_TEAM_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_TEAM_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_TEAM_TITLE_PRESET_OPTIONS,
  teamSectionLayoutIsAside,
  type PortfolioTeamCardBorder,
  type PortfolioTeamSectionSettings,
} from '@/components/portfolio/portfolio-team-settings';
import {
  applyTeamPaletteToSettings,
  DEFAULT_TEAM_COLOR_BINDINGS,
  DEFAULT_TEAM_PALETTE,
  mergeTeamColorBindings,
  mergeTeamPalette,
  patchTeamColorBinding,
  patchTeamPaletteSlotColor,
  PORTFOLIO_TEAM_COLOR_SLOT_OPTIONS,
  type TeamColorSlot,
} from '@/components/portfolio/portfolio-team-palette-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';

export type TeamSubSection = 'general' | 'header' | 'cards' | 'image' | 'socials' | 'palette' | 'background';

const SUBSECTIONS: { value: TeamSubSection; label: string }[] = [
  { value: 'general', label: 'Général' },
  { value: 'header', label: 'En-tête' },
  { value: 'cards', label: 'Cartes' },
  { value: 'image', label: 'Images' },
  { value: 'socials', label: 'Réseaux sociaux' },
  { value: 'palette', label: 'Palette' },
  { value: 'background', label: 'Arrière-plan' },
];

export function normalizeTeamSubSection(value: string | undefined): TeamSubSection {
  return SUBSECTIONS.some((item) => item.value === value) ? value as TeamSubSection : 'general';
}

function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <select
        value={value}
        onChange={(event) => {
          const option = options.find((item) => String(item.value) === event.target.value);
          if (option) onChange(option.value);
        }}
        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
      >
        {options.map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-3">
      <span className="text-sm font-semibold text-neutral-900">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4" />
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
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 rounded-lg border p-1" />
        <input
          type="text"
          value={value}
          onChange={(event) => /^#[0-9a-f]{6}$/i.test(event.target.value) && onChange(event.target.value)}
          className="w-28 rounded-lg border border-neutral-200 px-3 py-2 font-mono text-sm"
        />
      </div>
    </label>
  );
}

export function TeamSettingsPanel({
  team,
  onChange,
  subSection = 'general',
  onSubSectionChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: (patch: Partial<PortfolioTeamSectionSettings>) => void;
  subSection?: TeamSubSection;
  onSubSectionChange?: (value: TeamSubSection) => void;
}) {
  const current = normalizeTeamSubSection(subSection);
  const palette = mergeTeamPalette(DEFAULT_TEAM_PALETTE, team.teamPalette);
  const bindings = mergeTeamColorBindings(DEFAULT_TEAM_COLOR_BINDINGS, team.teamColorBindings);

  return (
    <div className="space-y-6">
      <SelectField
        label="Réglages de l’équipe"
        value={current}
        options={SUBSECTIONS}
        onChange={(value) => onSubSectionChange?.(value)}
      />

      {current === 'general' ? (
        <div className="space-y-5">
          <Toggle label="Afficher la section" checked={team.enabled} onChange={(enabled) => onChange({ enabled })} />
          <SectionHeroPaletteToggle
            enabled={team.useHeroPalette !== false}
            onChange={(useHeroPalette) =>
              onChange(
                (useHeroPalette
                  ? { useHeroPalette, ...applyTeamPaletteToSettings(team) }
                  : { useHeroPalette }) as Partial<PortfolioTeamSectionSettings>
              )
            }
          />
          <div className="grid gap-3">
            {PORTFOLIO_TEAM_LAYOUT_OPTIONS.map((layout) => (
              <button
                key={layout.value}
                type="button"
                onClick={() => onChange({ layout: layout.value })}
                className={`rounded-2xl border p-4 text-left ${team.layout === layout.value ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10' : 'border-neutral-200 bg-white'}`}
              >
                <span className="block text-sm font-bold text-neutral-950">{layout.label}</span>
                <span className="mt-1 block text-xs text-neutral-500">{layout.description}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Colonnes" value={team.columns} options={[1, 2, 3, 4].map((value) => ({ value: value as 1 | 2 | 3 | 4, label: String(value) }))} onChange={(columns) => onChange({ columns })} />
            <SelectField label="Espacement" value={team.gap} options={PORTFOLIO_TEAM_GAP_OPTIONS} onChange={(gap) => onChange({ gap })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle label="Afficher les noms" checked={team.showName} onChange={(showName) => onChange({ showName })} />
            <Toggle label="Afficher les rôles" checked={team.showResponsibility} onChange={(showResponsibility) => onChange({ showResponsibility })} />
            <Toggle label="Afficher les images" checked={team.showImage} onChange={(showImage) => onChange({ showImage })} />
            <Toggle label="Afficher les réseaux" checked={team.showSocials} onChange={(showSocials) => onChange({ showSocials })} />
          </div>
        </div>
      ) : null}

      {current === 'header' ? (
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Disposition titre / contenu
            </p>
            <div className="grid gap-3">
              {PORTFOLIO_TEAM_SECTION_LAYOUT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ sectionLayout: option.value })}
                  className={`rounded-2xl border p-4 text-left ${(team.sectionLayout ?? 'stacked') === option.value ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10' : 'border-neutral-200 bg-white'}`}
                >
                  <span className="block text-sm font-bold text-neutral-950">{option.label}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{option.description}</span>
                </button>
              ))}
            </div>
            {teamSectionLayoutIsAside(team.sectionLayout) ? (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                En côte à côte, le titre et la grille d’équipe s’affichent en deux colonnes sur grand
                écran (empilés sur mobile).
              </p>
            ) : null}
          </div>

          <SelectField label="Title" value={team.titlePreset} options={PORTFOLIO_TEAM_TITLE_PRESET_OPTIONS} onChange={(titlePreset) => onChange({ titlePreset })} />
          {team.titlePreset === 'custom' ? <input value={team.titleCustom} onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })} className="w-full rounded-xl border border-neutral-200 px-3 py-2.5" placeholder="Custom title" /> : null}
          <SelectField label="Subtitle" value={team.subtitlePreset} options={PORTFOLIO_TEAM_SUBTITLE_PRESET_OPTIONS} onChange={(subtitlePreset) => onChange({ subtitlePreset })} />
          {team.subtitlePreset === 'default' || team.subtitlePreset === 'custom' ? (
            <textarea
              rows={3}
              value={team.subtitlePreset === 'custom' ? team.subtitleCustom : team.subtitle}
              onChange={(event) => onChange(team.subtitlePreset === 'custom' ? { subtitleCustom: event.target.value, subtitle: event.target.value } : { subtitle: event.target.value })}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5"
            />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {teamSectionLayoutIsAside(team.sectionLayout) ? (
              <p className="sm:col-span-2 text-sm text-neutral-500">
                Title alignment is hidden: the title stays centered in the side column
                {team.sectionLayout === 'aside-right' ? ' on the right' : ' on the left'} of the cards.
              </p>
            ) : (
              <SelectField
                label="Alignment"
                value={team.headerAlignment}
                options={['left', 'center', 'right'].map((value) => ({
                  value: value as typeof team.headerAlignment,
                  label: value === 'left' ? 'Left' : value === 'right' ? 'Right' : 'Center',
                }))}
                onChange={(headerAlignment) => onChange({ headerAlignment })}
              />
            )}
            <SelectField label="Title font" value={team.titleFont} options={['sans', 'serif', 'display'].map((value) => ({ value: value as typeof team.titleFont, label: value }))} onChange={(titleFont) => onChange({ titleFont })} />
            <SelectField label="Subtitle font" value={team.subtitleFont} options={['sans', 'serif', 'display'].map((value) => ({ value: value as typeof team.subtitleFont, label: value }))} onChange={(subtitleFont) => onChange({ subtitleFont })} />
          </div>
          {team.useHeroPalette === false ? <div className="grid gap-4 sm:grid-cols-2"><ColorField label="Couleur du titre" value={team.titleColor} onChange={(titleColor) => onChange({ titleColor })} /><ColorField label="Couleur du sous-titre" value={team.subtitleColor} onChange={(subtitleColor) => onChange({ subtitleColor })} /></div> : null}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Illustration SVG</p>
              <p className="mt-1 text-sm text-neutral-500">
                SVG décoratif à côté du contenu. Choisissez un style, puis placez-le à gauche ou à
                droite sur grand écran.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PORTFOLIO_TEAM_ILLUSTRATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ illustrationVariant: option.value })}
                  className={`rounded-2xl border p-3 text-left ${(team.illustrationVariant ?? 'none') === option.value ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10' : 'border-neutral-200 bg-white'}`}
                >
                  <span className="block text-sm font-bold text-neutral-950">{option.label}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{option.description}</span>
                </button>
              ))}
            </div>
            {(team.illustrationVariant ?? 'none') !== 'none' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {PORTFOLIO_TEAM_ILLUSTRATION_PLACEMENT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange({ illustrationPlacement: option.value })}
                    className={`rounded-2xl border p-3 text-left ${(team.illustrationPlacement ?? 'right') === option.value ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10' : 'border-neutral-200 bg-white'}`}
                  >
                    <span className="block text-sm font-bold text-neutral-950">{option.label}</span>
                    <span className="mt-1 block text-xs text-neutral-500">{option.description}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {current === 'cards' ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label={
                team.layout === 'directory'
                  ? 'Largeur de la liste'
                  : team.layout === 'spotlight'
                    ? 'Largeur du cadre'
                    : 'Largeur de carte'
              }
              value={team.cardMaxWidth ?? 'sm'}
              options={[
                { value: 'xs', label: 'XS' },
                { value: 'sm', label: 'S' },
                { value: 'md', label: 'M' },
                { value: 'lg', label: 'L' },
                { value: 'xl', label: 'XL' },
                { value: 'full', label: 'Pleine largeur' },
              ].map((option) => ({ value: option.value as typeof team.cardMaxWidth, label: option.label }))}
              onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
            />
            <SelectField
              label={
                team.layout === 'profile-cards' ||
                team.layout === 'hover-cards' ||
                team.layout === 'cover-cards' ||
                team.layout === 'avatar-cards' ||
                team.layout === 'float-cards'
                  ? 'Alignement du texte'
                  : 'Alignement'
              }
              value={team.listAlign ?? 'center'}
              options={[
                { value: 'left' as const, label: 'Gauche' },
                { value: 'center' as const, label: 'Centre' },
                { value: 'right' as const, label: 'Droite' },
              ]}
              onChange={(listAlign) => onChange({ listAlign })}
            />
            <SelectField
              label={
                team.layout === 'spotlight'
                  ? 'Taille du portrait'
                  : team.layout === 'profile-cards' || team.layout === 'hover-cards' || team.layout === 'cover-cards'
                    ? 'Taille de la photo'
                    : 'Taille d’avatar'
              }
              value={team.avatarSize ?? 'md'}
              options={
                team.layout === 'spotlight' || team.layout === 'profile-cards' || team.layout === 'hover-cards' || team.layout === 'cover-cards'
                  ? [
                      { value: 'sm' as const, label: 'S' },
                      { value: 'md' as const, label: 'M' },
                      { value: 'lg' as const, label: 'L' },
                      { value: 'xl' as const, label: 'XL' },
                    ]
                  : team.layout === 'avatar-cards' || team.layout === 'float-cards'
                    ? [
                        { value: 'sm' as const, label: 'S · 80 px' },
                        { value: 'md' as const, label: 'M · 112 px' },
                        { value: 'lg' as const, label: 'L · 144 px' },
                        { value: 'xl' as const, label: 'XL · 192 px' },
                      ]
                    : [
                      { value: 'sm' as const, label: 'S · 64 px' },
                      { value: 'md' as const, label: 'M · 96 px' },
                      { value: 'lg' as const, label: 'L · 128 px' },
                      { value: 'xl' as const, label: 'XL · 176 px' },
                    ]
              }
              onChange={(avatarSize) => onChange({ avatarSize })}
            />
            <SelectField
              label="Taille des icônes"
              value={team.socialIconSize}
              options={[
                { value: 'sm' as const, label: 'S · 28 px' },
                { value: 'md' as const, label: 'M · 36 px' },
                { value: 'lg' as const, label: 'L · 48 px' },
                { value: 'xl' as const, label: 'XL · 64 px' },
              ]}
              onChange={(socialIconSize) => onChange({ socialIconSize })}
            />
            <SelectField label="Arrondi" value={team.cardRadius} options={['none', 'sm', 'md', 'lg', 'xl'].map((value) => ({ value: value as typeof team.cardRadius, label: value }))} onChange={(cardRadius) => onChange({ cardRadius })} />
            <SelectField label="Marge intérieure" value={team.cardPadding} options={['none', 'sm', 'md', 'lg'].map((value) => ({ value: value as typeof team.cardPadding, label: value }))} onChange={(cardPadding) => onChange({ cardPadding })} />
            <SelectField label="Ombre" value={team.cardShadow} options={['none', 'soft', 'medium', 'strong'].map((value) => ({ value: value as typeof team.cardShadow, label: value }))} onChange={(cardShadow) => onChange({ cardShadow })} />
          </div>
          {team.layout === 'directory' ? (
            <Toggle
              label="Cartes indépendantes"
              checked={team.directoryDetachedCards !== false}
              onChange={(directoryDetachedCards) => onChange({ directoryDetachedCards })}
            />
          ) : null}
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Fond & bordure</p>
              <p className="mt-1 text-sm text-neutral-500">
                Couleur de fond et trait du cadre, pour tous les designs d’équipe.
              </p>
            </div>
            <Toggle
              label="Fond de la carte"
              checked={team.cardBackgroundEnabled !== false}
              onChange={(cardBackgroundEnabled) => onChange({ cardBackgroundEnabled })}
            />
            {team.cardBackgroundEnabled !== false ? (
              <ColorField
                label="Couleur du fond"
                value={team.cardBackgroundColor}
                onChange={(cardBackgroundColor) =>
                  team.useHeroPalette === false
                    ? onChange({ cardBackgroundColor })
                    : onChange(
                        patchTeamPaletteSlotColor(team, 'cardBackground', cardBackgroundColor) as Partial<PortfolioTeamSectionSettings>
                      )
                }
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold text-neutral-500">Bordure</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {PORTFOLIO_TEAM_CARD_BORDER_OPTIONS.map((option) => {
                  const active = option.value === (team.cardBorder ?? 'thin');
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange({ cardBorder: option.value as PortfolioTeamCardBorder })}
                      className={`rounded-2xl border px-2 py-2.5 text-sm font-semibold transition ${
                        active
                          ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                          : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {(team.cardBorder ?? 'thin') !== 'none' ? (
              <ColorField
                label="Couleur de bordure"
                value={team.cardBorderColor}
                onChange={(cardBorderColor) =>
                  team.useHeroPalette === false
                    ? onChange({ cardBorderColor })
                    : onChange(
                        patchTeamPaletteSlotColor(team, 'cardBorder', cardBorderColor) as Partial<PortfolioTeamSectionSettings>
                      )
                }
              />
            ) : null}
          </div>
          {team.useHeroPalette === false ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Nom" value={team.nameColor} onChange={(nameColor) => onChange({ nameColor })} />
              <ColorField
                label="Responsabilité"
                value={team.responsibilityColor}
                onChange={(responsibilityColor) => onChange({ responsibilityColor })}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {current === 'image' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Ratio" value={team.imageAspect} options={['square', 'portrait', 'landscape', 'auto'].map((value) => ({ value: value as typeof team.imageAspect, label: value }))} onChange={(imageAspect) => onChange({ imageAspect })} />
          <SelectField label="Ajustement" value={team.imageFit} options={[{ value: 'cover', label: 'Couvrir' }, { value: 'contain', label: 'Contenir' }]} onChange={(imageFit) => onChange({ imageFit })} />
          <SelectField label="Position" value={team.imagePosition} options={['center', 'top', 'bottom', 'left', 'right'].map((value) => ({ value: value as typeof team.imagePosition, label: value }))} onChange={(imagePosition) => onChange({ imagePosition })} />
        </div>
      ) : null}

      {current === 'socials' ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Taille"
              value={team.socialIconSize}
              options={[
                { value: 'sm' as const, label: 'S · 28 px' },
                { value: 'md' as const, label: 'M · 36 px' },
                { value: 'lg' as const, label: 'L · 48 px' },
                { value: 'xl' as const, label: 'XL · 64 px' },
              ]}
              onChange={(socialIconSize) => onChange({ socialIconSize })}
            />
            <SelectField label="Style" value={team.socialIconStyle} options={['circle', 'soft', 'outline', 'minimal'].map((value) => ({ value: value as typeof team.socialIconStyle, label: value }))} onChange={(socialIconStyle) => onChange({ socialIconStyle })} />
          </div>
          {team.useHeroPalette === false ? <div className="grid gap-4 sm:grid-cols-2"><ColorField label="Icône" value={team.socialIconColor} onChange={(socialIconColor) => onChange({ socialIconColor })} /><ColorField label="Fond d’icône" value={team.socialBackgroundColor} onChange={(socialBackgroundColor) => onChange({ socialBackgroundColor })} /></div> : null}
        </div>
      ) : null}

      {current === 'palette' ? (
        <div className="space-y-4">
          <SectionHeroPaletteToggle enabled={team.useHeroPalette !== false} onChange={(useHeroPalette) => onChange((useHeroPalette ? { useHeroPalette, ...applyTeamPaletteToSettings(team) } : { useHeroPalette }) as Partial<PortfolioTeamSectionSettings>)} />
          {team.useHeroPalette !== false ? PORTFOLIO_TEAM_COLOR_SLOT_OPTIONS.map((slot) => (
            <label key={slot.value} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
              <span className="text-sm font-semibold">{slot.label}</span>
              <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: resolveHeroPaletteColor(palette, bindings[slot.value]) }} />
              <select
                value={bindings[slot.value]}
                onChange={(event) => onChange(patchTeamColorBinding(team, slot.value as TeamColorSlot, event.target.value as HeroPaletteTokenId) as Partial<PortfolioTeamSectionSettings>)}
                className="col-span-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              >
                {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => <option key={token.value} value={token.value}>{token.label}</option>)}
              </select>
            </label>
          )) : <p className="text-sm text-neutral-500">La palette globale est désactivée : utilisez les couleurs manuelles des autres onglets.</p>}
        </div>
      ) : null}

      {current === 'background' ? <SectionBackgroundSettingsFields settings={team} onChange={onChange} /> : null}
    </div>
  );
}
