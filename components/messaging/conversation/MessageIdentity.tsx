import { Avatar } from '@/components/ui/Avatar';

type MessageIdentityProps = {
  name: string;
  avatarUrl?: string | null;
};

export function MessageIdentity({ name, avatarUrl }: MessageIdentityProps) {
  return (
    <div className="flex w-10 shrink-0 flex-col items-center sm:w-11">
      <Avatar avatarUrl={avatarUrl} name={name} size="md" tone="muted" />
    </div>
  );
}
