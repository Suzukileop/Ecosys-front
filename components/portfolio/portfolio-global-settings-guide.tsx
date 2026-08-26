import type { ReactNode } from 'react';

export type GlobalSettingsSubSection =
  | 'theme'
  | 'background'
  | 'order'
  | 'titles'
  | 'layout'
  | 'typography';

export const GLOBAL_SETTINGS_SUB_SECTIONS: {
  id: GlobalSettingsSubSection;
  label: string;
  description: string;
  tip: string;
}[] = [
  {
    id: 'theme',
    label: 'Theme & preferences',
    description: 'Color palette for the whole portfolio, plus owner shortcuts.',
    tip: 'Pick one palette pair (Indigo, Classic, Verdant, Vive, Safran, Citron, Rouge, Écarlate, or Ardoise). Light mode only flips sombre ↔ clair inside that pair — it never jumps to another palette.',
  },
  {
    id: 'background',
    label: 'Page background',
    description: 'Solid color or fixed wallpaper behind every section.',
    tip: 'Fixed image applies under every section. Enable a section image fill to override only that section. Library holds up to 5 uploads to pick from.',
  },
  {
    id: 'order',
    label: 'Section order',
    description: 'Reorder middle sections. Hero stays first, Footer last.',
    tip: 'Order here drives both the page flow and the navigation destinations.',
  },
  {
    id: 'titles',
    label: 'Titles & motion',
    description: 'Global title & subtitle typography, alignment, orientation, sticky titles, and motion.',
    tip: 'Body font lives under Typography too. Set Style source to Global on titles/subtitles for shared headline styles.',
  },
  {
    id: 'layout',
    label: 'Layout & width',
    description: 'Content column width and side margins across breakpoints.',
    tip: 'On phone, gutters compress automatically — tune width for desktop first.',
  },
  {
    id: 'typography',
    label: 'Typography & title box',
    description:
      'Site-wide body font (all text), section title & subtitle styles, and optional title chrome box.',
    tip: 'Font is only chosen in Police principale and applied everywhere.',
  },
];

function GuideFrame({
  children,
  caption,
  highlight,
}: {
  children: ReactNode;
  caption: string;
  highlight: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-neutral-50 via-white to-neutral-100/80">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        <div className="relative mx-auto w-full max-w-[17rem] shrink-0 sm:mx-0 sm:w-[15.5rem]">
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-[0_10px_28px_rgba(15,15,15,0.06)]">
            {children}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
            What this controls
          </p>
          <p className="mt-1.5 text-sm font-semibold leading-snug text-neutral-900">{caption}</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">{highlight}</p>
        </div>
      </div>
    </div>
  );
}

function PageChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-neutral-100/80 p-2">
      <div className="mb-1.5 flex items-center gap-1 px-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-md border border-neutral-200/80 bg-white">
        {children}
      </div>
    </div>
  );
}

function SectionBands({
  activeIndex,
  emphasizeTitle,
  titleAlign = 'left',
  narrow = false,
  wideGutter = false,
}: {
  activeIndex?: number;
  emphasizeTitle?: boolean;
  titleAlign?: 'left' | 'center' | 'right';
  narrow?: boolean;
  wideGutter?: boolean;
}) {
  const bands = [
    { h: 'h-[22%]', label: 'Hero' },
    { h: 'h-[18%]', label: 'Work' },
    { h: 'h-[18%]', label: 'About' },
    { h: 'h-[16%]', label: 'Contact' },
  ];
  const pad = wideGutter ? 'px-4' : narrow ? 'px-1.5' : 'px-2.5';

  return (
    <div className={`flex h-full flex-col gap-1 py-1.5 ${pad}`}>
      {bands.map((band, index) => {
        const active = activeIndex === index;
        return (
          <div
            key={band.label}
            className={`${band.h} rounded-sm border ${
              active
                ? 'border-orange-300/80 bg-orange-50/90 ring-2 ring-orange-200/70'
                : 'border-neutral-200/70 bg-neutral-50'
            }`}
          >
            {emphasizeTitle ? (
              <div
                className={`flex h-full items-start px-1.5 pt-1 ${
                  titleAlign === 'center'
                    ? 'justify-center'
                    : titleAlign === 'right'
                      ? 'justify-end'
                      : 'justify-start'
                }`}
              >
                <span
                  className={`rounded-sm px-1 py-0.5 text-[7px] font-bold uppercase tracking-wide ${
                    active ? 'bg-neutral-900 text-white' : 'bg-neutral-200/80 text-neutral-500'
                  }`}
                >
                  {band.label}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function GlobalSettingsGuideMockup({
  section,
}: {
  section: GlobalSettingsSubSection;
}) {
  if (section === 'theme') {
    return (
      <GuideFrame
        caption="Global dark/light palette colors the whole site."
        highlight="Swatches feed buttons, accents, and default surfaces. Custom copies let you experiment without losing the originals."
      >
        <PageChrome>
          <div className="flex h-full flex-col gap-1.5 p-2">
            <div className="h-[28%] rounded-sm bg-gradient-to-br from-orange-200 via-amber-50 to-white ring-2 ring-orange-300/70" />
            <div className="grid flex-1 grid-cols-3 gap-1">
              {['#111111', '#f97316', '#e5e5e5', '#ffffff', '#78716c', '#fed7aa'].map((color) => (
                <div
                  key={color}
                  className="rounded-sm border border-neutral-200/80 shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </PageChrome>
      </GuideFrame>
    );
  }

  if (section === 'background') {
    return (
      <GuideFrame
        caption="Page background sits behind every section."
        highlight="None keeps theme chrome. Solid paints the full page. Fixed image acts as a viewport wallpaper."
      >
        <PageChrome>
          <div className="relative h-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fdba74_0%,#fff7ed_42%,#f5f5f5_100%)]" />
            <div className="absolute inset-x-2 top-2 bottom-2 rounded-sm border-2 border-dashed border-orange-400/80 bg-white/35 backdrop-blur-[1px]" />
            <div className="absolute inset-x-3 top-3 space-y-1.5">
              <div className="h-4 rounded-sm bg-white/80 shadow-sm" />
              <div className="h-8 rounded-sm bg-white/70 shadow-sm" />
              <div className="h-6 rounded-sm bg-white/70 shadow-sm" />
            </div>
          </div>
        </PageChrome>
      </GuideFrame>
    );
  }

  if (section === 'order') {
    return (
      <GuideFrame
        caption="Reorder the middle of the page stack."
        highlight="Hero is locked at the top and Footer at the bottom. Move Work, Services, About, and the rest with the arrows."
      >
        <PageChrome>
          <div className="flex h-full flex-col gap-1 p-2">
            <div className="flex h-[18%] items-center justify-between rounded-sm border border-neutral-200 bg-neutral-100 px-1.5">
              <span className="text-[7px] font-bold uppercase text-neutral-400">Hero</span>
              <span className="text-[8px] text-neutral-300">locked</span>
            </div>
            {['Work', 'Services', 'About'].map((label, index) => (
              <div
                key={label}
                className={`flex h-[18%] items-center justify-between rounded-sm border px-1.5 ${
                  index === 1
                    ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-200/80'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <span className="text-[7px] font-bold uppercase text-neutral-600">{label}</span>
                <span className="text-[9px] font-semibold text-neutral-400">↕</span>
              </div>
            ))}
            <div className="flex h-[14%] items-center justify-between rounded-sm border border-neutral-200 bg-neutral-100 px-1.5">
              <span className="text-[7px] font-bold uppercase text-neutral-400">Footer</span>
              <span className="text-[8px] text-neutral-300">locked</span>
            </div>
          </div>
        </PageChrome>
      </GuideFrame>
    );
  }

  if (section === 'titles') {
    return (
      <GuideFrame
        caption="Section titles & subtitles — global typography, alignment, scroll & motion."
        highlight="Font cards and color/size controls apply to every section when Style source is Global. Sticky mode keeps the title visible while content scrolls."
      >
        <PageChrome>
          <SectionBands activeIndex={1} emphasizeTitle titleAlign="center" />
        </PageChrome>
      </GuideFrame>
    );
  }

  if (section === 'layout') {
    return (
      <GuideFrame
        caption="Content width and side margins."
        highlight="Orange guides show the content column. Wider gutters pull content inward; Full width hugs the edges on large screens."
      >
        <PageChrome>
          <div className="relative h-full bg-neutral-50">
            <div className="absolute inset-y-0 left-0 w-[18%] border-r border-dashed border-orange-300/80 bg-orange-50/40" />
            <div className="absolute inset-y-0 right-0 w-[18%] border-l border-dashed border-orange-300/80 bg-orange-50/40" />
            <div className="absolute inset-y-2 left-[18%] right-[18%] rounded-sm border-2 border-orange-400/70 bg-white shadow-sm">
              <SectionBands narrow />
            </div>
          </div>
        </PageChrome>
      </GuideFrame>
    );
  }

  return (
    <GuideFrame
      caption="Typography and optional title chrome."
      highlight="Titles and subtitles can inherit per-section styles or follow one global look. Title box adds background, border, and padding around the heading."
    >
      <PageChrome>
        <div className="flex h-full flex-col justify-center gap-2 px-3">
          <div className="rounded-md border-2 border-orange-300 bg-orange-50/60 px-2 py-1.5 ring-2 ring-orange-200/60">
            <div className="h-2.5 w-[80%] max-w-[7rem] rounded-sm bg-neutral-900" />
          </div>
          <div className="h-1.5 w-[60%] max-w-[5.5rem] rounded-sm bg-neutral-300" />
          <div className="mt-1 space-y-1">
            <div className="h-1.5 rounded-sm bg-neutral-100" />
            <div className="h-1.5 w-5/6 rounded-sm bg-neutral-100" />
            <div className="h-1.5 w-2/3 rounded-sm bg-neutral-100" />
          </div>
        </div>
      </PageChrome>
    </GuideFrame>
  );
}

export function GlobalSettingsTip({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm leading-relaxed text-neutral-500">
      <span className="font-semibold text-neutral-700">Tip — </span>
      {children}
    </p>
  );
}
