import api from '@/lib/api';
import type {
  AgentProposeBody,
  BotMessageBody,
  BotResponseDto,
  ChatMessageDto,
  CheckoutSessionResponse,
  DemoUploadResponse,
  EcosystemBotMessage,
  NicheRequestFormData,
  NicheRequestResponse,
  PagedResponse,
  RefUploadResponse,
  ScheduledConfigDto,
  SpringPageRaw,
  TariffConfigResponse,
  ValidateModelBody,
} from '@/types/ecosystem';
import type { ScheduledPostDto } from '@/types/scheduler';

const DEFAULT_TARIF_UNIT_CENTS = 1000;

export function normalizeSpringPage<T>(raw: SpringPageRaw<T>): PagedResponse<T> {
  const content = raw.content ?? [];
  const number = raw.number ?? 0;
  const size = raw.size ?? content.length;
  const totalElements = raw.totalElements ?? content.length;
  const totalPages = raw.totalPages ?? (size > 0 ? Math.ceil(totalElements / size) : 0);
  return {
    content,
    page: number,
    size,
    totalElements,
    totalPages,
    last: raw.last ?? (totalPages <= 1 || number >= totalPages - 1),
  };
}

export async function submitNicheRequest(data: NicheRequestFormData): Promise<NicheRequestResponse> {
  const res = await api.post<NicheRequestResponse>('/api/ecosystem/niche-request', data);
  return res.data;
}

export async function uploadRefFile(requestId: string, file: File): Promise<RefUploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<RefUploadResponse>(
    `/api/ecosystem/niche-request/${encodeURIComponent(requestId)}/ref-file`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return res.data;
}

export async function getMyRequests(
  status?: string,
  page = 0,
  size = 20
): Promise<PagedResponse<NicheRequestResponse>> {
  const res = await api.get<SpringPageRaw<NicheRequestResponse>>('/api/ecosystem/my-requests', {
    params: { ...(status ? { status } : {}), page, size },
  });
  return normalizeSpringPage(res.data);
}

export async function getRequestDetail(id: string): Promise<NicheRequestResponse> {
  const res = await api.get<NicheRequestResponse>(
    `/api/ecosystem/my-requests/${encodeURIComponent(id)}`
  );
  return res.data;
}

export async function cancelRequest(id: string): Promise<void> {
  await api.delete(`/api/ecosystem/my-requests/${encodeURIComponent(id)}`);
}

export async function sendBotMessage(requestId: string, message: string): Promise<BotResponseDto> {
  const body: BotMessageBody = { message };
  const res = await api.post<BotResponseDto>(
    `/api/ecosystem/bot/${encodeURIComponent(requestId)}/message`,
    body
  );
  return res.data;
}

export async function getBotHistory(requestId: string): Promise<EcosystemBotMessage[]> {
  const res = await api.get<EcosystemBotMessage[]>(
    `/api/ecosystem/bot/${encodeURIComponent(requestId)}/history`
  );
  return Array.isArray(res.data) ? res.data : [];
}

/** Passage explicite en attente d’agent après la conversation bot (ne dépend plus du seul marqueur IA). */
export async function confirmNicheAfterBot(requestId: string): Promise<NicheRequestResponse> {
  const res = await api.post<NicheRequestResponse>(
    `/api/ecosystem/my-requests/${encodeURIComponent(requestId)}/confirm-bot-chat`
  );
  return res.data;
}

export async function validateModel(
  requestId: string,
  data: ValidateModelBody
): Promise<NicheRequestResponse> {
  const res = await api.put<NicheRequestResponse>(
    `/api/ecosystem/niche-requests/${encodeURIComponent(requestId)}/validate`,
    data
  );
  return res.data;
}

/** Ignore l'étape validation modèle et passe le dossier en paiement (VALIDATED). */
export async function skipModelValidation(requestId: string): Promise<NicheRequestResponse> {
  const res = await api.post<NicheRequestResponse>(
    `/api/ecosystem/my-requests/${encodeURIComponent(requestId)}/skip-model-validation`
  );
  return res.data;
}

export async function createCheckoutSession(requestId: string): Promise<CheckoutSessionResponse> {
  const res = await api.post<CheckoutSessionResponse>(
    `/api/payments/ecosystem/${encodeURIComponent(requestId)}/checkout`
  );
  return res.data;
}

export async function confirmEcosystemPayment(requestId: string): Promise<void> {
  await api.post(`/api/payments/ecosystem/${encodeURIComponent(requestId)}/confirm`);
}

export async function getScheduledConfig(requestId: string): Promise<ScheduledConfigDto> {
  const res = await api.get<ScheduledConfigDto>(
    `/api/scheduler/config/${encodeURIComponent(requestId)}`
  );
  return res.data;
}

export async function updateScheduledConfig(
  requestId: string,
  data: ScheduledConfigDto
): Promise<ScheduledConfigDto> {
  const res = await api.put<ScheduledConfigDto>(
    `/api/scheduler/config/${encodeURIComponent(requestId)}`,
    data
  );
  return res.data;
}

export async function getNicheAgentPosts(
  requestId: string,
  page = 0,
  size = 20
): Promise<PagedResponse<ScheduledPostDto>> {
  const res = await api.get<PagedResponse<ScheduledPostDto>>(
    `/api/scheduler/posts/niche/${encodeURIComponent(requestId)}`,
    { params: { page, size } }
  );
  return res.data;
}

export async function fetchTarifUnitaireCents(): Promise<number> {
  try {
    const res = await api.get<TariffConfigResponse>('/api/admin/config/tarif');
    const cents = res.data?.tarifUnitaireCents;
    if (typeof cents === 'number' && cents > 0) return cents;
  } catch {
    /* admin-only ou endpoint absent : fallback */
  }
  return DEFAULT_TARIF_UNIT_CENTS;
}

// --- Agent ---

export async function listAgentNicheRequests(
  page = 0,
  size = 20
): Promise<PagedResponse<NicheRequestResponse>> {
  const res = await api.get<SpringPageRaw<NicheRequestResponse>>('/api/agent/niche-requests', {
    params: { page, size },
  });
  return normalizeSpringPage(res.data);
}

export async function getAgentNicheRequestDetail(id: string): Promise<NicheRequestResponse> {
  const res = await api.get<NicheRequestResponse>(
    `/api/agent/niche-requests/${encodeURIComponent(id)}`
  );
  return res.data;
}

/** Historique chat bot client — réservé agent/admin (ne pas utiliser getBotHistory côté agent). */
export async function getAgentBotHistory(requestId: string): Promise<EcosystemBotMessage[]> {
  const res = await api.get<EcosystemBotMessage[]>(
    `/api/agent/niche-requests/${encodeURIComponent(requestId)}/bot-history`
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function uploadDemoContent(requestId: string, file: File): Promise<DemoUploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<DemoUploadResponse>(
    `/api/agent/niche-requests/${encodeURIComponent(requestId)}/demo-upload`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return res.data;
}

export async function proposeAgentModel(
  requestId: string,
  body: AgentProposeBody
): Promise<NicheRequestResponse> {
  const res = await api.put<NicheRequestResponse>(
    `/api/agent/niche-requests/${encodeURIComponent(requestId)}/propose`,
    body
  );
  return res.data;
}

export async function listAgentActiveNiches(
  page = 0,
  size = 20
): Promise<PagedResponse<NicheRequestResponse>> {
  const res = await api.get<PagedResponse<NicheRequestResponse>>('/api/agent/niche-requests/active', {
    params: { page, size },
  });
  return res.data;
}

export async function listAgentDeliveredContent(
  requestId: string,
  page = 0,
  size = 50
): Promise<PagedResponse<ScheduledPostDto>> {
  const res = await api.get<PagedResponse<ScheduledPostDto>>(
    `/api/agent/niche-requests/${encodeURIComponent(requestId)}/delivered-content`,
    { params: { page, size } }
  );
  return res.data;
}

export async function deliverAgentContent(
  requestId: string,
  file: File,
  platform: string,
  caption?: string
): Promise<ScheduledPostDto> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<ScheduledPostDto>(
    `/api/agent/niche-requests/${encodeURIComponent(requestId)}/deliver-content`,
    form,
    {
      params: { platform, ...(caption?.trim() ? { caption: caption.trim() } : {}) },
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return res.data;
}

/** Historique messagerie dossier (Stomp) — room = `niche-{nicheRequestUuid}` (aligné backend) */
export async function getChatHistoryPage(
  roomId: string,
  page = 0,
  size = 20
): Promise<PagedResponse<ChatMessageDto>> {
  const res = await api.get<SpringPageRaw<ChatMessageDto> | ChatMessageDto[]>(
    `/api/chat/${encodeURIComponent(roomId)}/history`,
    { params: { page, size } }
  );
  const raw = res.data;
  if (Array.isArray(raw)) {
    return {
      content: raw,
      page: 0,
      size: raw.length,
      totalElements: raw.length,
      totalPages: 1,
      last: true,
    };
  }
  return normalizeSpringPage(raw);
}
