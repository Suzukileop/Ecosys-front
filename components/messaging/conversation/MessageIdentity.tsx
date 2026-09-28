import { Avatar } from '@/components/ui/Avatar';

type MessageIdentityProps = {
  name: string;
  avatarUrl?: string | null;
};

/**
 * The portrait beside an incoming message.
 *
 * Two things only: a hairline ring, which seats a photograph on the panel without a shadow and
 * gives a letter-avatar an edge of its own, and the section's held-back saturation (see
 * `.msg-portrait` in globals.css). In the thread the value is fixed rather than reactive — the
 * face is not a control here, so it should not answer the cursor.
 */
export function MessageIdentity({ name, avatarUrl }: MessageIdentityProps) {
  return (
    <div className="flex w-10 shrink-0 flex-col items-center sm:w-11">
      <span className="msg-portrait msg-portrait--thread block overflow-hidden rounded-full ring-1 ring-[var(--msg-hairline-strong)]">
        <Avatar avatarUrl={avatarUrl} name={name} size="md" tone="muted" />
      </span>
    </div>
  );
}
