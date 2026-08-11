import type { NextStep, NicheRequestResponse } from '@/types/ecosystem';

export const ECOSYSTEM_STEP_LABELS = [
  'Form',
  'Bot confirmation',
  'Waiting for agent',
  'Payment',
  'Scheduling',
  'Active',
] as const;

export type EcosystemViewStep = NextStep | 'FORM';

/** Index UI partagé : attente agent + validation modèle = même étape. */
export const AGENT_REVIEW_STEP_INDEX = 2;

export function stepIndexForNextStep(next: NextStep | string): number {
  switch (next) {
    case 'BOT_CHAT':
      return 1;
    case 'WAITING_AGENT':
    case 'VALIDATE_MODEL':
      return AGENT_REVIEW_STEP_INDEX;
    case 'PAYMENT':
      return 3;
    case 'SCHEDULER':
      return 4;
    case 'ACTIVE':
      return 5;
    default:
      return 0;
  }
}

export function viewStepForIndex(index: number): EcosystemViewStep {
  switch (index) {
    case 0:
      return 'FORM';
    case 1:
      return 'BOT_CHAT';
    case 2:
      return 'WAITING_AGENT';
    case 3:
      return 'PAYMENT';
    case 4:
      return 'SCHEDULER';
    case 5:
      return 'ACTIVE';
    default:
      return 'FORM';
  }
}

export function isModelReadyForReview(request: NicheRequestResponse): boolean {
  return (
    request.nextStep === 'VALIDATE_MODEL' ||
    request.status === 'PROPOSED' ||
    Boolean(request.demoContentUrl?.trim())
  );
}
