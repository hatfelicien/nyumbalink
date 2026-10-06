import { useState } from 'react'
import { ExternalLink, Play } from 'lucide-react'
import { useDataSaver } from '../../context/DataSaverContext'
import { sizedImage } from '../../utils/image'

function youTubeId(url: string) {
  return url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)?.[1] ?? null
}

export interface VideoTourProps {
  url: string
  poster: string
  title: string
}

/** Nothing is fetched until the visitor presses play, so the tour costs no data unless it is watched. */
export function VideoTour({ url, poster, title }: VideoTourProps) {
  const [playing, setPlaying] = useState(false)
  const { dataSaver } = useDataSaver()
  const videoId = youTubeId(url)
  const isFile = /\.(mp4|webm|ogg)(\?|$)/i.test(url)

  if (!videoId && !isFile) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-400">
        Watch the video tour
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    )
  }

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group relative block aspect-video w-full overflow-hidden rounded-2xl"
        aria-label={`Play video tour of ${title}`}
      >
        <img src={sizedImage(poster, 960, dataSaver)} alt="" loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy-950/40 text-white transition-colors group-hover:bg-navy-950/50">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-navy-900">
            <Play className="h-6 w-6 translate-x-0.5" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium">{dataSaver ? 'Play video tour (uses mobile data)' : 'Play video tour'}</span>
        </span>
      </button>
    )
  }

  return videoId ? (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
      title={`Video tour of ${title}`}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      className="aspect-video w-full rounded-2xl"
    />
  ) : (
    <video src={url} controls autoPlay playsInline className="aspect-video w-full rounded-2xl bg-navy-950" />
  )
}
