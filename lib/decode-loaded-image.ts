/** Reveal only a complete, decoded request; ignore a source replaced while decoding. */
export async function decodeLoadedImage(image: HTMLImageElement): Promise<boolean> {
  const source = image.currentSrc || image.src;
  if (!image.complete || image.naturalWidth === 0) return false;
  try {
    await image.decode();
  } catch {
    // A failed/aborted decode must not reveal broken or half-painted pixels.
    return false;
  }
  return image.isConnected && image.complete && image.naturalWidth > 0
    && (image.currentSrc || image.src) === source;
}
