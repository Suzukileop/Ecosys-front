import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactLink, LegalDocument, type LegalSection } from '@/components/legal/LegalDocument';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Terms of service — Skraft',
  description: 'The rules for using Skraft: accounts, plans and payments, the marketplace, your content and acceptable use.',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Agreement',
    content: (
      <>
        <p>
          These terms are a contract between you and the operator of {LEGAL.serviceName} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;). By creating an account or using Skraft, you accept them. If you do not agree, please do not
          use the service.
        </p>
        <p>
          Our <Link href="/privacy">Privacy policy</Link> explains how we handle your personal data and is part of these
          terms.
        </p>
      </>
    ),
  },
  {
    id: 'who-we-are',
    title: 'Who we are',
    content: (
      <p>
        {LEGAL.serviceName} is currently operated by an independent{' '}
        {LEGAL.operator.name ? `individual (${LEGAL.operator.name})` : 'individual'}, not by a registered company. You can reach us at{' '}
        <ContactLink />.
      </p>
    ),
  },
  {
    id: 'accounts',
    title: 'Your account',
    content: (
      <>
        <ul>
          <li>
            You must be at least {LEGAL.minimumAge} years old. If you are under {LEGAL.parentalConsentUntil}, or under
            the age of digital consent where you live, a parent or legal guardian must accept these terms for you.
          </li>
          <li>You must be of legal age, or have your guardian&apos;s permission, to buy or sell anything on Skraft.</li>
          <li>Give accurate information and keep it up to date. Your username must not impersonate anyone.</li>
          <li>
            Keep your password secret. You are responsible for what happens under your account; tell us straight away
            if you think someone else has accessed it.
          </li>
          <li>One person, one account, unless we agree otherwise.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'the-service',
    title: 'What Skraft offers',
    content: (
      <>
        <p>
          Skraft lets you build a portfolio or CV, open a store, present your services, publish content, message and
          call other members and find talent.
        </p>
        <p>
          We are constantly improving Skraft, so features may change, be added or be removed. Some features may be
          labelled as beta and may not work perfectly. We will give you reasonable notice before removing a feature you
          pay for.
        </p>
      </>
    ),
  },
  {
    id: 'plans-and-payments',
    title: 'Plans and payments',
    content: (
      <>
        <ul>
          <li>The Free plan costs nothing and has the limits shown on our pricing page.</li>
          <li>
            Paid plans and services are billed at the price, currency and billing period shown before you pay. Any
            applicable taxes are indicated at checkout.
          </li>
          <li>Payments are processed by our payment provider; its own terms also apply to the payment.</li>
          <li>
            Renewal and cancellation terms are shown before you subscribe. When you cancel, you keep access until the end
            of the period you have paid for.
          </li>
        </ul>
        <h3>Right of withdrawal (consumers in the EU)</h3>
        <p>
          If you are a consumer in the European Union, you have 14 days from the purchase of a paid plan to withdraw
          without giving a reason, by writing to <ContactLink />. If you asked us to start the service during that
          period, we may deduct the share of the service already provided. For digital content delivered immediately,
          you lose this right once delivery has started, provided you expressly agreed to this at checkout.
        </p>
        <p>We also refund you whenever the law requires it, for example if a paid feature does not work as described.</p>
      </>
    ),
  },
  {
    id: 'marketplace',
    title: 'Buying and selling',
    content: (
      <>
        <p>
          Skraft provides the tools for members to sell products and services to each other. Unless stated otherwise,
          the sale is a contract between the seller and the buyer; we are not a party to it.
        </p>
        <h3>If you sell</h3>
        <ul>
          <li>You must have the right to sell what you list, and describe it honestly, including price and delivery.</li>
          <li>
            You are responsible for complying with the laws that apply to you — including consumer protection, taxes
            and, if you sell as a business, informing buyers that you are a professional seller.
          </li>
          <li>You must deliver what you sold, and handle questions, returns and refunds fairly and lawfully.</li>
        </ul>
        <h3>If you buy</h3>
        <ul>
          <li>Read the listing before paying, and contact the seller through Skraft with any question.</li>
          <li>
            Digital products are licensed for your personal use unless the seller says otherwise. Do not share or resell
            them.
          </li>
        </ul>
        <p>
          If something goes wrong with a purchase, first contact the seller. If you cannot resolve it, report it to us
          and we will help where we can.
        </p>
      </>
    ),
  },
  {
    id: 'your-content',
    title: 'Your content',
    content: (
      <>
        <p>
          You keep all rights to the content you publish on Skraft — your portfolio, products, posts, files and
          messages.
        </p>
        <p>
          To run the service, you give us a worldwide, non-exclusive, royalty-free licence to host, store, copy, adapt
          (for example resize or reformat) and display your content, only as needed to operate Skraft and to show it to
          the audience you choose. This licence ends when you delete the content, except for copies kept for a limited
          time in backups or that other members already received (such as messages).
        </p>
        <p>
          You confirm that you have the rights needed for everything you publish, including the consent of the people
          who appear in it.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    content: (
      <>
        <p>When using Skraft, you must not:</p>
        <ul>
          <li>Break the law or encourage others to do so.</li>
          <li>Publish content that is hateful, harassing, violent, sexually explicit, or that exploits minors.</li>
          <li>Infringe anyone&apos;s copyright, trademark, privacy or other rights.</li>
          <li>Sell counterfeit, illegal, dangerous or prohibited goods or services.</li>
          <li>Scam, mislead or impersonate other people, or send spam.</li>
          <li>Collect other members&apos; data without their permission.</li>
          <li>
            Interfere with Skraft: hacking, probing for vulnerabilities without permission, overloading our systems, or
            scraping it with automated tools.
          </li>
          <li>Bypass plan limits, sell your account, or create accounts to get around a suspension.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'moderation',
    title: 'Reports and moderation',
    content: (
      <>
        <p>
          Anyone can report content or a member they believe breaks these terms or the law, using the report option or
          by writing to <ContactLink />.
        </p>
        <p>
          We review reports and may remove content, limit features, or suspend or close accounts that break these terms.
          Where we can, we will tell you what we did and why. If you think we made a mistake, reply to our message or
          write to us and we will review the decision.
        </p>
      </>
    ),
  },
  {
    id: 'our-rights',
    title: 'Our intellectual property',
    content: (
      <p>
        Skraft, its name, logo, design, templates and software belong to us or our licensors. You may use the templates
        and the code we provide to build and run your own pages, including exported source code on plans that include
        it. You may not resell or redistribute our templates or software as a competing product.
      </p>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third-party services',
    content: (
      <p>
        Skraft relies on third-party services such as Google sign-in, payment and storage providers. Links to other
        websites, including those that members publish, are not under our control and we are not responsible for them.
      </p>
    ),
  },
  {
    id: 'termination',
    title: 'Closing your account',
    content: (
      <>
        <p>
          You can stop using Skraft and delete your account at any time from your settings. See our{' '}
          <Link href="/privacy">Privacy policy</Link> for what happens to your data.
        </p>
        <p>
          We may suspend or close your account if you seriously or repeatedly break these terms, if the law requires it,
          or to protect other members. Except in urgent cases, we will warn you first. If we close Skraft entirely, we
          will give you reasonable notice so you can export your data, and refund any period you paid for but cannot
          use.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Responsibility and liability',
    content: (
      <>
        <p>
          We work hard to keep Skraft available and secure, but we provide it &ldquo;as is&rdquo; and cannot guarantee
          that it will always be uninterrupted or error-free. Keep your own copies of important content.
        </p>
        <p>
          We are not responsible for the content members publish, for transactions between members, or for indirect
          losses such as lost profits or opportunities. Our total liability to you is limited to the amount you paid us
          in the 12 months before the event.
        </p>
        <p>
          Nothing in these terms limits liability that cannot be limited by law, such as for fraud, gross negligence or
          personal injury, or removes rights you have as a consumer.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    content: (
      <p>
        We may update these terms as Skraft evolves or the law changes. For significant changes, we will tell you by
        email or in the app at least 30 days before they take effect. If you do not agree, you can close your account
        before then; continuing to use Skraft afterwards means you accept the new terms.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Applicable law and disputes',
    content: (
      <>
        <p>
          {LEGAL.operator.country
            ? `These terms are governed by the laws of ${LEGAL.operator.country}.`
            : 'These terms are governed by the laws of the country where the operator is established.'}{' '}
          If you are a consumer, you also keep the protection of the mandatory rules of the country where you live, and
          you can bring a claim before its courts.
        </p>
        <p>
          If you have a problem, please contact us first at <ContactLink /> — most issues can be solved quickly and
          amicably.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <p>
        Questions about these terms: <ContactLink />.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      current="/terms"
      title="Terms of service"
      intro={
        <p>
          These terms explain the rules for using {LEGAL.serviceName}: what we provide, what we expect from you, and
          what happens when something goes wrong. We have kept them as short and clear as we could.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
