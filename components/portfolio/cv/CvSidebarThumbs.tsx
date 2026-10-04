import type { ReactNode } from 'react';
import type { AtsDensity, AtsVariantId, CvTemplateId } from '@/lib/cv-data';

/** Sketch line: `ink` for names and headings, `soft` for body copy, `light` on dark panels. */
function L({ w, h = 2, tone = 'soft' }: { w: string; h?: number; tone?: 'ink' | 'soft' | 'light' }) {
  const color = tone === 'ink' ? 'bg-[#111111]/70' : tone === 'light' ? 'bg-white/40' : 'bg-[#111111]/[0.14]';
  return <span className={`block rounded-full ${color}`} style={{ width: w, height: h }} />;
}

function Paper({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`relative aspect-[210/297] w-full overflow-hidden bg-white ${className}`}>{children}</div>;
}

function Body({ rows = 3, gap = 'gap-[3px]' }: { rows?: number; gap?: string }) {
  const widths = ['100%', '92%', '96%', '70%', '88%', '80%'];
  return (
    <div className={`flex flex-col ${gap}`}>
      {Array.from({ length: rows }, (_, index) => (
        <L key={index} w={widths[index % widths.length]} />
      ))}
    </div>
  );
}

export function TemplateThumb({ id }: { id: CvTemplateId }) {
  if (id === 'modern') {
    return (
      <Paper>
        <div className="absolute inset-y-0 left-0 flex w-[34%] flex-col gap-[3px] bg-[#1A1A1A] px-[9%] pt-[14%]">
          <span className="mb-[4px] block aspect-square w-[60%] rounded-full bg-white/25" />
          <L w="80%" tone="light" />
          <L w="60%" tone="light" />
          <L w="70%" tone="light" />
        </div>
        <div className="flex flex-col gap-[3px] pl-[44%] pr-[10%] pt-[14%]">
          <L w="80%" h={4} tone="ink" />
          <span className="mt-[5px] block h-[2px] w-[35%] rounded-full bg-[#FF5722]" />
          <Body rows={4} />
          <span className="mt-[5px] block h-[2px] w-[35%] rounded-full bg-[#FF5722]" />
          <Body rows={3} />
        </div>
      </Paper>
    );
  }
  if (id === 'editorial') {
    return (
      <Paper>
        <div className="flex flex-col gap-[3px] px-[12%] pt-[14%]">
          <L w="85%" h={6} tone="ink" />
          <L w="55%" h={6} tone="ink" />
          <div className="mt-[8px] grid grid-cols-[30%_1fr] gap-[6px]">
            <L w="80%" tone="ink" />
            <Body rows={3} />
            <L w="80%" tone="ink" />
            <Body rows={3} />
          </div>
        </div>
      </Paper>
    );
  }
  return (
    <Paper>
      <div className="flex flex-col gap-[3px] px-[12%] pt-[14%]">
        <L w="60%" h={4} tone="ink" />
        <L w="40%" />
        <span className="mt-[6px] block h-px w-full bg-[#111111]/30" />
        <Body rows={3} />
        <span className="mt-[6px] block h-px w-full bg-[#111111]/30" />
        <Body rows={4} />
        <span className="mt-[6px] block h-px w-full bg-[#111111]/30" />
        <Body rows={2} />
      </div>
    </Paper>
  );
}

function Heading({ variant }: { variant: AtsVariantId }) {
  switch (variant) {
    case 'harvard':
      return (
        <div className="mt-[6px] flex flex-col gap-[2px]">
          <L w="40%" tone="ink" />
          <span className="block h-px w-full bg-[#111111]/50" />
        </div>
      );
    case 'banded':
      return (
        <div className="mt-[6px] flex justify-center bg-[#D9EAD3] py-[2px]">
          <L w="40%" tone="ink" />
        </div>
      );
    case 'signature':
      return (
        <div className="mt-[7px] flex flex-col gap-[2px]">
          <L w="45%" tone="ink" />
          <span className="block h-px w-full bg-[#111111]/25" />
        </div>
      );
    case 'compact':
      return (
        <div className="mt-[4px] flex flex-col gap-[1px]">
          <L w="35%" tone="ink" />
          <span className="block h-px w-full bg-[#111111]/50" />
        </div>
      );
    default:
      return (
        <div className="mt-[6px] flex items-center gap-[3px]">
          <L w="30%" tone="ink" />
          <span className="block h-px flex-1 bg-[#111111]/20" />
        </div>
      );
  }
}

export function VariantThumb({ id }: { id: AtsVariantId }) {
  const centered = id === 'harvard';
  const bodyGap = id === 'compact' ? 'gap-[2px]' : 'gap-[3px]';
  const rows = id === 'compact' ? 4 : 3;
  return (
    <Paper>
      <div className={`flex flex-col gap-[3px] ${id === 'compact' ? 'px-[9%] pt-[10%]' : 'px-[12%] pt-[13%]'}`}>
        {id === 'banded' ? (
          <>
            <div className="flex items-end justify-between">
              <L w="50%" h={4} tone="ink" />
              <L w="28%" />
            </div>
            <span className="mt-[2px] block h-px w-full bg-[#111111]/60" />
          </>
        ) : id === 'signature' ? (
          <>
            <L w="75%" h={4} tone="ink" />
            <L w="40%" h={1.5} />
            <span className="mt-[3px] block h-[5px] w-full bg-[#595959]" />
          </>
        ) : (
          <div className={`flex flex-col gap-[3px] ${centered ? 'items-center' : ''}`}>
            <L w={centered ? '55%' : '60%'} h={4} tone="ink" />
            <L w="40%" />
          </div>
        )}
        <Heading variant={id} />
        <Body rows={rows} gap={bodyGap} />
        <Heading variant={id} />
        <Body rows={rows} gap={bodyGap} />
        {id === 'compact' ? (
          <>
            <Heading variant={id} />
            <Body rows={rows} gap={bodyGap} />
          </>
        ) : null}
      </div>
    </Paper>
  );
}

const DENSITY_GAP: Record<AtsDensity, string> = {
  tight: 'gap-[2px]',
  medium: 'gap-[4px]',
  airy: 'gap-[6px]',
  spacious: 'gap-[9px]',
};

export function DensityGlyph({ id }: { id: AtsDensity }) {
  return (
    <span className={`flex w-7 flex-col ${DENSITY_GAP[id]}`} aria-hidden>
      <span className="block h-[2px] w-full rounded-full bg-current" />
      <span className="block h-[2px] w-[80%] rounded-full bg-current" />
      <span className="block h-[2px] w-full rounded-full bg-current" />
    </span>
  );
}
