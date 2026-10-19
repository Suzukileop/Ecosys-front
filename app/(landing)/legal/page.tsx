import type { Metadata } from 'next';
import { ContactLink, LegalDocument, type LegalSection } from '@/components/legal/LegalDocument';
import { LEGAL } from '@/lib/legal';
import { msg } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: msg('Legal notice — Skraft'),
  description: msg('Who publishes Skraft, how to reach them and where the service is hosted.'),
  alternates: { canonical: '/legal' },
};

/* Values come from lib/legal.ts; the ones still unknown (see LEGAL_TODO.md) fall back to neutral
   wording instead of placeholders. */
const SECTIONS: LegalSection[] = [
  {
    id: 'publisher',
    title: msg('Publisher'),
    content: (
      <>
        <p>
          {LEGAL.serviceName} is published by an independent{' '}
          {LEGAL.operator.name ? `individual, ${LEGAL.operator.name}` : 'individual'}, not by a registered company.
        </p>
        {LEGAL.operator.address || LEGAL.operator.country ? (
          <p>
            Address: {[LEGAL.operator.address, LEGAL.operator.country].filter(Boolean).join(', ')}.
          </p>
        ) : null}
        <p>
          Contact: <ContactLink />.
        </p>
      </>
    ),
  },
  {
    id: 'hosting',
    title: msg('Hosting'),
    content: (
      <p>
        The name and address of the providers hosting the website, its database and the files you upload are
        available on request at <ContactLink />. How your data is handled is described in our{' '}
        <a href="/privacy">privacy policy</a>.
      </p>
    ),
  },
  {
    id: 'content',
    title: msg('Content and intellectual property'),
    content: (
      <>
        <p>
          The {LEGAL.serviceName} name, interface and texts belong to their publisher. Portfolios, products and
          messages belong to the people who publish them, under the <a href="/terms">terms of service</a>.
        </p>
        <p>
          To report content that infringes your rights, write to <ContactLink />.
        </p>
      </>
    ),
  },
];

export default function LegalNoticePage() {
  return (
    <LegalDocument
      current="/legal"
      title="Legal notice"
      intro={<p>The information the law asks every website to publish about who runs it.</p>}
      sections={SECTIONS}
    />
  );
}
