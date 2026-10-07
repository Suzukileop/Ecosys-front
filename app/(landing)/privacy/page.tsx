import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactLink, LegalDocument, type LegalSection } from '@/components/legal/LegalDocument';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy policy — Skraft',
  description: 'What personal data Skraft collects, why, who it is shared with and how to exercise your rights.',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who is responsible',
    content: (
      <>
        <p>
          {LEGAL.serviceName} is currently operated by an independent{' '}
          {LEGAL.operator.name ? `individual (${LEGAL.operator.name})` : 'individual'}, not by a registered company. In
          data protection terms, the operator is the <strong>data controller</strong>: the person who decides why and how your personal
          data is processed.
        </p>
        <p>
          For any question about this policy or your data, write to <ContactLink />.
        </p>
      </>
    ),
  },
  {
    id: 'data-we-collect',
    title: 'What we collect',
    content: (
      <>
        <h3>Account</h3>
        <ul>
          <li>Your full name, username and email address.</li>
          <li>Your password, which we only store as a one-way hash (we cannot read it).</li>
          <li>
            If you sign in with Google: your Google account ID, name, email address and profile picture. We never
            receive your Google password.
          </li>
          <li>Technical account records such as creation date, last login and active sessions.</li>
        </ul>

        <h3>Profile, portfolio and CV</h3>
        <p>Everything you choose to add to your profile, for example:</p>
        <ul>
          <li>Photo, bio, skills, languages, education, experience and social links.</li>
          <li>Optional details such as gender and nationality.</li>
          <li>Contact details you publish (emails, phone numbers, addresses).</li>
          <li>
            Your location: city, country, timezone and, if you allow your browser to share it, precise coordinates.
          </li>
          <li>
            Information about other people you add, such as team members. Only add people who have agreed to it.
          </li>
        </ul>

        <h3>Content and activity</h3>
        <ul>
          <li>Products, services, posts, images, videos and files you upload.</li>
          <li>Comments, reactions, ratings, favourites, follows, shares and reports.</li>
          <li>Purchases and their transaction history.</li>
        </ul>

        <h3>Messages and calls</h3>
        <ul>
          <li>The messages and attachments you exchange in Skraft conversations.</li>
          <li>
            For audio and video calls: who called whom and when. The calls themselves are connected directly between
            participants and are not recorded.
          </li>
        </ul>

        <h3>Payments</h3>
        <p>
          Payments are handled by our payment provider. We receive the amount, a payment reference and the payment
          status. We never receive or store card numbers or mobile money PINs.
        </p>

        <h3>Technical data</h3>
        <ul>
          <li>Your IP address, used briefly to protect forms and the API against abuse (rate limiting).</li>
          <li>Server logs used for security and troubleshooting, which identify you by an internal ID.</li>
          <li>Profile visits: when you are signed in and open a creator&apos;s profile, the visit is recorded.</li>
        </ul>

        <h3>Messages you send through Skraft</h3>
        <p>
          When you use a portfolio contact form or the feedback form, we process your name, email and message to
          deliver them to the creator or to us.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'Why we use it',
    content: (
      <>
        <p>We only use your data for the purposes below, each with a legal basis under the GDPR:</p>
        <ul>
          <li>
            <strong>Providing Skraft</strong> — your account, portfolio, store, messaging, calls and purchases. Basis: performance of our contract with you (the <Link href="/terms">Terms</Link>).
          </li>
          <li>
            <strong>Security and abuse prevention</strong> — protecting accounts, rate limiting, investigating reports.
            Basis: our legitimate interest in keeping the service safe.
          </li>
          <li>
            <strong>Showing nearby creators and your location</strong> — only when you allow your browser to share it.
            Basis: your consent, which you can withdraw in your browser settings at any time.
          </li>
          <li>
            <strong>Service messages</strong> — notifications about your account, messages, orders and important
            changes. Basis: performance of our contract.
          </li>
          <li>
            <strong>Improving Skraft</strong> — reading the feedback you send us. Basis: our legitimate interest.
          </li>
          <li>
            <strong>Legal obligations</strong> — keeping payment records and answering lawful requests from
            authorities.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> sell your data, show you advertising, or use analytics or advertising trackers. We
          do not make decisions about you based solely on automated processing.
        </p>
      </>
    ),
  },
  {
    id: 'what-others-see',
    title: 'What other people can see',
    content: (
      <>
        <ul>
          <li>
            Your public profile, portfolio, store, services and published posts are visible to anyone, including people
            who are not signed in. Contact details you publish there are public too.
          </li>
          <li>
            When you visit a creator&apos;s profile while signed in, they can see that you visited. You can turn on{' '}
            <strong>Browse profiles privately</strong> in your settings to stop this.
          </li>
          <li>Other members can see when you are online, unless you hide your status in your settings.</li>
          <li>Messages are only visible to the people in the conversation.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Who we share it with',
    content: (
      <>
        <p>
          We share data only with the service providers we need to run Skraft (our &ldquo;processors&rdquo;), and only
          what each of them needs:
        </p>
        <ul>
          <li>
            <strong>Cloudflare</strong> — file storage for uploaded images, videos and documents, and secure network
            delivery.
          </li>
          <li>
            <strong>Our email delivery provider</strong> — sending notifications and contact-form messages.
          </li>
          <li>
            <strong>Google</strong> — Google sign-in if you choose it, and connection servers that help set up audio
            and video calls.
          </li>
          <li>
            <strong>OpenStreetMap</strong> — turning coordinates into a place name and searching locations, when you
            use location features.
          </li>
        </ul>
        <p>
          We may also disclose data when the law requires it, to protect the rights and safety of users, or to a
          successor if Skraft is transferred, in which case this policy continues to apply.
        </p>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'International transfers',
    content: (
      <>
        <p>
          Some providers above process data outside your country, including in the United States (Google,
          Cloudflare). These countries may not offer the same level of protection as the European Union. Where
          possible, we rely on the safeguards these providers offer, such as the European Commission&apos;s Standard
          Contractual Clauses.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and local storage',
    content: (
      <>
        <p>
          We do not use advertising or analytics cookies. We only store what is needed for Skraft to work and to
          remember your choices:
        </p>
        <ul>
          <li>
            <strong>Session cookie</strong> (<code>refresh_token</code>) — keeps you signed in for up to 7 days.
            Strictly necessary.
          </li>
          <li>
            <strong>Interface preferences</strong> — theme, sidebar state, layout and editor settings, stored in your
            browser.
          </li>
          <li>
            <strong>Session cache</strong> — avoids signing you in again on every page load.
          </li>
          <li>
            <strong>Visit counter ID</strong> — a random identifier that lets us count unique visits to a profile
            without knowing who you are.
          </li>
          <li>
            <strong>Temporary data</strong> — drafts, unread counters and, if you share it, your approximate location
            for sorting results. Deleted when you close the tab.
          </li>
        </ul>
        <p>You can clear these at any time from your browser settings; you may then need to sign in again.</p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    content: (
      <>
        <ul>
          <li>We keep your account data for as long as your account is open.</li>
          <li>
            When you delete your account, we immediately sign you out everywhere, anonymise your account details
            (name, username, email, phone, photo, password and Google link) and erase your profile, portfolio, posts,
            products, uploaded files, comments, reactions, reviews, follows, profile visits and notifications.
          </li>
          <li>
            Messages you sent remain visible to the people you sent them to, shown as from a &ldquo;Deleted
            user&rdquo;, as with any messaging service.
          </li>
          <li>
            Purchase and payment records are kept, without your profile, for as long as accounting and tax laws
            require.
          </li>
          <li>Security logs are kept only as long as needed to investigate incidents.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    content: (
      <>
        <p>
          We protect your data with encrypted connections (HTTPS), hashed passwords, short-lived access tokens, a
          session cookie that scripts cannot read, and access controls on our systems.
        </p>
        <p>
          Messages are encrypted in transit but are <strong>not end-to-end encrypted</strong>: they are stored on our
          servers so you can read them on any device.
        </p>
        <p>
          No system is perfectly secure. If a breach puts your rights at risk, we will notify you and the competent
          authority as the law requires.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    content: (
      <>
        <p>You can at any time:</p>
        <ul>
          <li>
            <strong>Access</strong> your data and get a complete copy — use <em>Download your data</em> in your
            settings.
          </li>
          <li>
            <strong>Correct</strong> inaccurate data, directly in your profile and settings.
          </li>
          <li>
            <strong>Delete</strong> your account and your data from your settings.
          </li>
          <li>
            <strong>Restrict or object</strong> to processing based on our legitimate interest.
          </li>
          <li>
            <strong>Port</strong> your data to another service in a machine-readable format.
          </li>
          <li>
            <strong>Withdraw your consent</strong>, for example to location sharing, without affecting what was done
            before.
          </li>
        </ul>
        <p>
          Write to <ContactLink /> to exercise any of these rights. We answer within one month and may ask you to
          confirm your identity. If you are not satisfied, you can complain to the data protection authority of the
          country where you live.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    content: (
      <>
        <p>
          You must be at least {LEGAL.minimumAge} to use Skraft. If you are under {LEGAL.parentalConsentUntil}, or under
          the age of digital consent where you live, a parent or legal guardian must agree to these terms and to the
          processing of your data on your behalf.
        </p>
        <p>
          If you believe a child has created an account without that permission, contact us at <ContactLink /> and we
          will delete it.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    content: (
      <p>
        If we change this policy, we will update the date at the top of this page. If the change is significant, we
        will also tell you by email or in the app before it takes effect.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <p>
        Questions, requests or concerns about your privacy: <ContactLink />.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      current="/privacy"
      title="Privacy policy"
      intro={
        <p>
          This policy explains what personal data {LEGAL.serviceName} collects when you use our website and apps, why
          we collect it, who we share it with and the choices you have. We have tried to keep it short and plain.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
