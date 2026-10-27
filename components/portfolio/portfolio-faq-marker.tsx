import type { PortfolioFaqMarker } from '@/components/portfolio/portfolio-faq-settings';

/**
 * The list marker in front of a question, shared by every FAQ design (FAQ → General → List marker).
 *
 * The element is always the zero-padded number in the DOM; the chosen kind is a `data-pf-faq-marker` on the frame
 * wrapper, and globals.css turns the number into a dot, a short dash, or hides it. Designs that already drew an
 * index (Kinetic, Masonry, Split index) give THEIR number the `pf-faq-marker` class and keep it on Auto; the
 * others add this element, which stays hidden on Auto so their look is unchanged until a marker is picked.
 */
export function FaqQuestionMarker({ index, block = false }: { index: number; block?: boolean }) {
  return (
    <span
      className={`pf-faq-marker pf-faq-marker--added${block ? ' pf-faq-marker--block' : ''}`}
      aria-hidden="true"
      data-pf-no-color-transition=""
    >
      {String(index + 1).padStart(2, '0')}
    </span>
  );
}

export type { PortfolioFaqMarker };
