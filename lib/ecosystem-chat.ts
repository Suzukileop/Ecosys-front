/**
 * Affichage : retire la balise technique de confirmation niche dans les réponses bot.
 */
export function stripNicheConfirmedTag(content: string): string {
  return content.replace(/\[NICHE_CONFIRMED\]\s*/gi, '').trim();
}
