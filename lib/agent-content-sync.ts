export const AGENT_CONTENT_SYNC_EVENT = 'agent-content-sync';

export type AgentContentSyncDetail = {
  nicheId: string;
  contentId?: string | null;
};

export function dispatchAgentContentSync(nicheId: string, contentId?: string | null): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<AgentContentSyncDetail>(AGENT_CONTENT_SYNC_EVENT, {
      detail: { nicheId, contentId: contentId ?? null },
    }),
  );
}
