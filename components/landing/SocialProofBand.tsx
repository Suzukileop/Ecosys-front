'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { brandGradientText } from '@/components/landing/landingBrand';
import { motion, useInView } from 'framer-motion';

/* ── Monochrome brand icons (currentColor) ── */

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.27a8.2 8.2 0 004.78 1.52V7.34a4.85 4.85 0 01-1-.65z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconYouTube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconSnapchat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.235-.024.462-.036.676.019.015.039.03.06.044 1.089.745 2.688 1.216 4.234 1.553.462.099.924.188 1.366.276.442.089.864.177 1.248.276.384.099.73.207 1.037.325.307.118.575.246.804.384.229.138.42.286.573.444.153.158.267.326.342.504.075.178.113.366.113.563 0 .178-.028.346-.084.504-.056.158-.142.306-.258.444-.116.138-.261.266-.435.384-.174.118-.377.226-.609.325-.232.099-.492.188-.78.266-.288.078-.604.146-.948.207-.344.061-.716.113-1.116.158-.4.045-.828.082-1.284.11-.456.028-.94.047-1.452.057-.512.01-1.052.01-1.62 0-.568-.01-1.108-.029-1.62-.057-.512-.028-.996-.062-1.452-.11-.456-.047-.884-.097-1.284-.158-.4-.061-.772-.126-1.116-.207-.344-.081-.66-.168-.948-.266-.288-.098-.548-.207-.78-.325-.232-.118-.435-.246-.609-.384-.174-.138-.319-.286-.435-.444-.116-.158-.202-.326-.258-.484-.056-.158-.084-.326-.084-.504 0-.197.038-.385.113-.563.075-.178.189-.346.342-.504.153-.158.344-.306.573-.444.229-.138.497-.266.804-.384.307-.118.653-.226 1.037-.325.384-.099.806-.187 1.248-.276.442-.089.904-.177 1.366-.276 1.546-.337 3.145-.808 4.234-1.553.021-.014.041-.029.06-.044-.012-.214-.024-.441-.036-.676l-.003-.06c-.104-1.628-.23-3.654.299-4.847C16.659 1.069 13.196.793 12.206.793z" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconPinterest({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.403.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

function IconThreads({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.865-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.883-1.652-3.183.035-1.448.833-2.696 2.164-3.433 1.095-.6 2.507-.863 4.009-.752l.019-2.003c-1.924-.065-3.566.305-4.857 1.098-1.658 1.045-2.738 2.744-2.824 4.667-.05 1.468.396 2.745 1.291 3.692.895.948 2.156 1.434 3.646 1.408 1.744-.03 3.104-.752 4.043-2.147.755-1.123 1.168-2.645 1.228-4.525.023-.696.028-1.4.028-2.113V9.887h2.018v6.667c0 .633.011 1.266.034 1.898.102 2.979 1.122 5.303 3.028 6.712 1.605 1.196 3.712 1.803 6.262 1.803h.007c3.581-.024 6.334-1.205 8.184-3.509 1.647-2.053 2.496-4.906 2.525-8.482v-.017c-.03-3.579-.879-6.43-2.525-8.482-1.85-2.304-4.603-3.485-8.184-3.509z" />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconTelegram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function IconDiscord({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  );
}

function IconTwitch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  );
}

function IconReddit({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.114l2.587-.547zM9.025 13.75a1.25 1.25 0 1 0 0 2.498 1.25 1.25 0 0 0 0-2.498zm5.95 0a1.25 1.25 0 1 0 0 2.498 1.25 1.25 0 0 0 0-2.498z" />
    </svg>
  );
}

/* ── Marquee items with brand-specific label styles ── */

type MarqueeEntry = {
  id: string;
  icon: ReactNode;
  label?: ReactNode;
};

const platformEntries: MarqueeEntry[] = [
  {
    id: 'tiktok',
    icon: <IconTikTok className="w-5 h-5 shrink-0" />,
    label: <span className="font-extrabold tracking-tight text-[15px]">TikTok</span>,
  },
  {
    id: 'instagram',
    icon: <IconInstagram className="w-5 h-5 shrink-0" />,
    label: (
      <span className="text-[15px] font-medium tracking-wide">Instagram</span>
    ),
  },
  {
    id: 'youtube',
    icon: <IconYouTube className="w-5 h-5 shrink-0" />,
    label: (
      <span className="text-[15px]">
        <span className="font-extrabold tracking-tight">You</span>
        <span className="font-bold tracking-tight">Tube</span>
      </span>
    ),
  },
  {
    id: 'facebook',
    icon: <IconFacebook className="w-5 h-5 shrink-0" />,
    label: <span className="font-bold lowercase text-[16px] tracking-tight">facebook</span>,
  },
  {
    id: 'x',
    icon: <IconX className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'snapchat',
    icon: <IconSnapchat className="w-5 h-5 shrink-0" />,
    label: <span className="font-bold tracking-wide text-[14px] uppercase">Snapchat</span>,
  },
  {
    id: 'linkedin',
    icon: <IconLinkedIn className="w-5 h-5 shrink-0" />,
    label: <span className="font-semibold tracking-normal text-[14px]">LinkedIn</span>,
  },
  {
    id: 'pinterest',
    icon: <IconPinterest className="w-5 h-5 shrink-0" />,
    label: <span className="font-bold tracking-tight text-[15px]">Pinterest</span>,
  },
  {
    id: 'threads',
    icon: <IconThreads className="w-5 h-5 shrink-0" />,
    label: <span className="font-semibold tracking-tight text-[15px]">Threads</span>,
  },
  {
    id: 'whatsapp',
    icon: <IconWhatsApp className="w-5 h-5 shrink-0" />,
    label: <span className="font-medium tracking-tight text-[15px]">WhatsApp</span>,
  },
  {
    id: 'telegram',
    icon: <IconTelegram className="w-5 h-5 shrink-0" />,
    label: <span className="font-medium tracking-wide text-[15px]">Telegram</span>,
  },
  {
    id: 'discord',
    icon: <IconDiscord className="w-5 h-5 shrink-0" />,
    label: <span className="font-bold tracking-tight text-[15px]">Discord</span>,
  },
  {
    id: 'twitch',
    icon: <IconTwitch className="w-5 h-5 shrink-0" />,
    label: <span className="font-extrabold tracking-tight text-[15px] uppercase">Twitch</span>,
  },
  {
    id: 'reddit',
    icon: <IconReddit className="w-5 h-5 shrink-0" />,
    label: <span className="font-bold tracking-tight text-[15px]">Reddit</span>,
  },
];

const marqueeEntries = platformEntries;

function MarqueeItem({ entry }: { entry: MarqueeEntry }) {
  return (
    <span
      className="marquee-item inline-flex shrink-0 items-center gap-2.5 px-8 text-neutral-400 opacity-55 dark:text-neutral-400 dark:opacity-50"
      aria-label={!entry.label && entry.id === 'x' ? 'X' : undefined}
    >
      {entry.icon}
      {entry.label}
    </span>
  );
}

const stats = [
  { value: 3, suffix: '', label: 'Portfolio, services & shop' },
  { value: 1, suffix: '', label: 'All-in-one platform' },
  { value: 0, suffix: '', label: 'Middlemen required' },
  { value: 24, suffix: '/7', label: 'Your page stays online' },
];

function CounterNumber({ target, suffix, isFloat }: { target: number; suffix: string; isFloat?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat
        ? (target * eased).toFixed(1)
        : Math.round(target * eased).toLocaleString('en-US');
      setDisplay(current.toString());
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, target, isFloat]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

function MarqueeTrack({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={ariaHidden || undefined}
    >
      {marqueeEntries.map((entry) => (
        <MarqueeItem key={`${entry.id}${ariaHidden ? '-dup' : ''}`} entry={entry} />
      ))}
    </div>
  );
}

export function SocialProofMarquee() {
  return (
    <section className="w-full lp-bg py-12 transition-colors duration-300">
      <h2 className="mb-8 px-4 text-center text-xl font-bold tracking-tight lp-text sm:mb-10 sm:text-2xl md:text-3xl">
        Publish your content everywhere, in a single click.
      </h2>
      <div className="lp-bg-card w-full border-y border-black/5 py-8 transition-colors duration-300 dark:border-white/5 sm:py-10">
        <div
          className="overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)]"
        >
          {/* Two equal tracks + translate3d(-50%) = seamless infinite loop (no jump / blink) */}
          <div className="lp-social-marquee flex w-max will-change-transform">
            <MarqueeTrack />
            <MarqueeTrack ariaHidden />
          </div>
        </div>
      </div>
    </section>
  );
}

export function SocialProofStats() {
  return (
    <section className="lp-bg-card w-full border-y border-black/5 py-12 transition-colors duration-300 dark:border-white/5">
      <div className="w-full lp-container-x grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className={`text-3xl md:text-4xl font-bold ${brandGradientText} mb-1`}>
              <CounterNumber target={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-sm lp-muted">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function SocialProofBand() {
  return <SocialProofMarquee />;
}
