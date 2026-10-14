import { Avatar } from '@/components/ui/Avatar';

type MessageIdentityProps = {
  name: string;
  avatarUrl?: string | null;
};

/**
 * The portrait beside the last bubble of an incoming run — 32px, no ring, no frame (X DM). At 40px
 * it took an eighth of a phone's width from every incoming message for a face the header already
 * shows.
 */
export function MessageIdentity({ name, avatarUrl }: MessageIdentityProps) {
  return (
    <div className="flex w-8 shrink-0 flex-col items-center">
      <span className="msg-portrait msg-portrait--thread block overflow-hidden rounded-full">
        <Avatar avatarUrl={avatarUrl} name={name} size="sm" tone="muted" />
      </span>
    </div>
  );
}
