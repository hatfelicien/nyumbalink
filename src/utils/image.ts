/**
 * Requests an image at the width it will actually be displayed at. The seed photos are
 * 1200px wide; a listing card needs about half that, and much less on a metered
 * connection. Only URLs from image CDNs that accept `w`/`q` params are rewritten —
 * uploaded object URLs pass through untouched.
 */
export function sizedImage(url: string, width: number, dataSaver = false) {
  if (!url.includes('images.unsplash.com')) return url
  const targetWidth = dataSaver ? Math.round(width * 0.6) : width
  const quality = dataSaver ? 50 : 75
  return url.replace(/([?&])w=\d+/, `$1w=${targetWidth}`).replace(/([?&])q=\d+/, `$1q=${quality}`)
}
