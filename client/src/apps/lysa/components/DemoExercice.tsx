import { useState } from 'react'
import { ArrowsClockwise, Lightbulb, Play, Wrench } from '@phosphor-icons/react'
import type { Exercise } from '../../../lib/types'
import { Feuille } from './ui'

/* Fiche « c'est quoi cet exercice ».
   Uniquement de vraies personnes. Les deux photos départ/arrivée d'abord,
   alternées : la position se reconnaît d'un coup d'œil. La vidéo ensuite,
   pour voir le mouvement en entier.
   Toutes les vidéos retenues durent moins d'une minute et commencent sur la
   démonstration : aucune introduction à passer, aucun minutage à deviner. */

export default function DemoExercice({
  exercice,
  ouverte,
  onFermer,
}: {
  exercice: Exercise
  ouverte: boolean
  onFermer: () => void
}) {
  const [lecture, setLecture] = useState(false)
  const photos = exercice.photos ?? []

  return (
    <Feuille
      ouverte={ouverte}
      onFermer={() => {
        setLecture(false)
        onFermer()
      }}
      titre={exercice.name}
    >
      <div className="space-y-5 pb-2">
        {/* Les deux photos, alternées : ça fait un petit gif du geste */}
        {photos.length >= 2 && (
          <figure className="relative overflow-hidden rounded-bonbon bg-petale-2">
            <img
              src={photos[0]}
              alt={`${exercice.name} — position de départ`}
              className="h-60 w-full object-contain"
            />
            <img
              src={photos[1]}
              alt={`${exercice.name} — position d'arrivée`}
              aria-hidden="true"
              className="photo-alterne absolute inset-0 h-60 w-full object-contain"
            />
            <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[rgba(61,36,48,0.75)] px-3 py-1.5 text-[13px] font-semibold text-white">
              <ArrowsClockwise size={14} weight="bold" /> départ · arrivée
            </span>
          </figure>
        )}

        {/* La vidéo. On ne charge l'iframe qu'au moment où elle appuie :
            sinon YouTube pose ses cookies et ralentit l'ouverture. */}
        {exercice.videoId &&
          (lecture ? (
            <div className="overflow-hidden rounded-bonbon bg-encre-lysa">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${exercice.videoId}?rel=0&autoplay=1`}
                title={`Démonstration : ${exercice.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          ) : (
            <button
              onClick={() => setLecture(true)}
              aria-label={`Voir la démonstration de ${exercice.name}`}
              className="relative block w-full overflow-hidden rounded-bonbon bg-encre-lysa transition-transform duration-100 active:scale-[0.99]"
            >
              <img
                src={`https://i.ytimg.com/vi/${exercice.videoId}/hqdefault.jpg`}
                alt=""
                className="aspect-video w-full object-cover opacity-90"
              />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-rose text-white shadow-[0_6px_20px_rgba(61,36,48,0.45)]">
                  <Play size={34} weight="fill" className="ml-1" />
                </span>
              </span>
              <span className="absolute right-3 bottom-3 rounded-full bg-[rgba(61,36,48,0.8)] px-3 py-1.5 text-[13px] font-semibold text-white">
                La voir en vidéo
              </span>
            </button>
          ))}

        {/* Le matériel ou le montage à la maison */}
        {exercice.setup && (
          <div className="flex items-start gap-3 rounded-[20px] bg-petale px-4 py-3.5">
            <Wrench size={20} weight="fill" className="mt-0.5 shrink-0 text-rose" />
            <p className="text-[16px] leading-snug text-encre-lysa">{exercice.setup}</p>
          </div>
        )}

        {/* Les repères, numérotés : on les suit dans l'ordre */}
        {exercice.howTo && exercice.howTo.length > 0 && (
          <div>
            <p className="mb-2.5 flex items-center gap-2 text-[15px] font-semibold text-rose-fonce">
              <Lightbulb size={18} weight="fill" /> Les points qui comptent
            </p>
            <ol className="space-y-2.5">
              {exercice.howTo.map((ligne, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-rond grid h-8 w-8 shrink-0 place-items-center rounded-full bg-petale text-[16px] font-bold text-rose-fonce">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-[17px] leading-snug text-encre-lysa">{ligne}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {exercice.muscles.length > 0 && (
          <p className="text-[15px] text-encre-lysa-2">
            Ça travaille : {exercice.muscles.join(', ')}.
          </p>
        )}
      </div>
    </Feuille>
  )
}
