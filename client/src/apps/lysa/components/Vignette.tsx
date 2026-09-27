import { useState } from 'react'
import { Barbell } from '@phosphor-icons/react'
import type { Exercise } from '../../../lib/types'

/* Vignette d'un exercice : une vraie photo, ou l'image de la vidéo.
   Plus aucun dessin — on montre un corps qui fait le mouvement. */

export function imageDe(exercice: Exercise): string | null {
  if (exercice.photos?.length) return exercice.photos[0]
  if (exercice.videoId) return `https://i.ytimg.com/vi/${exercice.videoId}/mqdefault.jpg`
  return null
}

export default function Vignette({
  exercice,
  className = '',
}: {
  exercice: Exercise
  className?: string
}) {
  const [cassee, setCassee] = useState(false)
  const src = imageDe(exercice)

  // Repli si l'image ne charge pas (pas de réseau, vidéo retirée) : une tuile
  // propre plutôt qu'un carré cassé.
  if (!src || cassee) {
    return (
      <div className={`grid place-items-center bg-petale-2 text-rose ${className}`}>
        <Barbell size={26} weight="fill" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setCassee(true)}
      className={`bg-petale-2 object-cover ${className}`}
    />
  )
}
