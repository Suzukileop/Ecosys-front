import {
  buildCreatorProductFlash,
  creatorProductsListPath,
  type CreatorProductFlashKey,
} from '@/lib/flash-feedback';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';

/** Toast immédiat — navigation client-side sans changement d’URL (ex. création inline). */
export function showCreatorProductFeedback(
  action: CreatorProductFlashKey,
  productTitle?: string
): void {
  pushFlashFeedback(buildCreatorProductFlash(action, productTitle));
}

/** Redirection PRG avec flash dans l’URL — lu au chargement (édition / suppression). */
export function creatorProductsRedirectAfterAction(
  action: CreatorProductFlashKey,
  productTitle?: string
): string {
  return creatorProductsListPath({ flash: action, productTitle });
}
