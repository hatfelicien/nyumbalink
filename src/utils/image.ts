/**
 * Requests an image at the width it will actually be displayed at. The seed photos are
 * 1200px wide; a listing card needs about half that, and much less on a metered
 * connection. Only URLs from image CDNs that accept `w`/`q` params are rewritten —
 * uploaded object URLs pass through untouched.
 */
/**
 * Crops an uploaded photo to a centred square and scales it down, returning a JPEG data
 * URL. A 256px profile photo is a few dozen kilobytes, small enough to keep with the
 * signed-in session in localStorage.
 */
export function resizeToSquare(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const side = Math.min(image.naturalWidth, image.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(url)
        reject(new Error('Your browser cannot process images.'))
        return
      }
      context.drawImage(
        image,
        (image.naturalWidth - side) / 2,
        (image.naturalHeight - side) / 2,
        side,
        side,
        0,
        0,
        size,
        size,
      )
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file is not an image we can read.'))
    }
    image.src = url
  })
}

export function sizedImage(url: string, width: number, dataSaver = false) {
  if (!url.includes('images.unsplash.com')) return url
  const targetWidth = dataSaver ? Math.round(width * 0.6) : width
  const quality = dataSaver ? 50 : 75
  return url.replace(/([?&])w=\d+/, `$1w=${targetWidth}`).replace(/([?&])q=\d+/, `$1q=${quality}`)
}
