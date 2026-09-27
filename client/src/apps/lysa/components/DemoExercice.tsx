import { useState } from 'react'
import { ArrowsClockwise, Lightbulb, PlayCircle, Wrench } from '@phosphor-icons/react'
import type { Exercise } from '../../../lib/types'
import { Feuille } from './ui'
import { PictoAnime } from './Picto'
import SchemaCanape from './SchemaCanape'
import SchemaSol from './SchemaSol'

/* Fiche « c'est quoi cet exercice ».
   Le dessin animé passe AVANT la photo, et c'est volontaire : les photos
   libres sont prises en salle, avec du matériel qu'elle n'a pas (un ballon
   de gym pour le leg curl, un banc pour le hip thrust). Le dessin, lui,
   montre le geste tel qu'il se fait chez elle, et il bouge vraiment.
   La photo reste en dessous, comme référence « en vrai ». */

export default function DemoExercice({
  exercice,
  ouverte,
  onFermer,
}: {
  exercice: Exercise
  ouverte: boolean
  onFermer: () => void
}) {
  const [videoOuverte, setVideoOuverte] = useState(false)
  const photos = exercice.photos ?? []

  return (
    <Feuille
      ouverte={ouverte}
      onFermer={() => {
        setVideoOuverte(false)
        onFermer()
      }}
      titre={exercice.name}
    >
      <div className="space-y-5 pb-2">
        {/* Le geste, dessiné et animé : la version faite à la maison */}
        <figure className="relative overflow-hidden rounded-bonbon bg-petale-2">
          <PictoAnime pattern={exercice.pattern} className="mx-auto h-60 w-60" />
          <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-rose px-3 py-1.5 text-[13px] font-semibold text-white">
            <ArrowsClockwise size={14} weight="bold" /> le geste
          </span>
        </figure>

        {/* Les montages qu'aucune photo de salle ne montre */}
        {exercice.pattern === 'hipthrust' && (
          <div className="rounded-bonbon bg-petale-2 p-4">
            <p className="mb-2 text-[15px] font-semibold text-rose-fonce">Le montage, sans banc</p>
            <SchemaCanape className="w-full" />
          </div>
        )}
        {exercice.pattern === 'legcurl' && (
          <div className="rounded-bonbon bg-petale-2 p-4">
            <p className="mb-2 text-[15px] font-semibold text-rose-fonce">Le montage, sans machine</p>
            <SchemaSol className="w-full" />
          </div>
        )}

        {/* La vidéo : chargée seulement si on la demande (sinon YouTube pose
            ses cookies et ralentit la feuille pour rien) */}
        {exercice.videoId &&
          (videoOuverte ? (
            <div className="overflow-hidden rounded-bonbon bg-encre-lysa">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${exercice.videoId}?rel=0`}
                title={`Démonstration : ${exercice.name}`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          ) : (
            <button
              onClick={() => setVideoOuverte(true)}
              className="flex h-16 w-full items-center justify-center gap-2.5 rounded-[22px] bg-encre-lysa text-[18px] font-semibold text-white transition-transform duration-100 active:scale-[0.98]"
            >
              <PlayCircle size={26} weight="fill" /> Voir quelqu'un le faire
            </button>
          ))}

        {/* La photo, en second : utile pour reconnaître la position, mais
            c'est une salle de sport, pas son salon. */}
        {photos.length >= 2 && (
          <figure>
            <p className="mb-2 text-[15px] font-semibold text-encre-lysa-2">En photo</p>
            <div className="relative overflow-hidden rounded-bonbon bg-petale-2">
              <img
                src={photos[0]}
                alt={`${exercice.name} — position de départ`}
                className="h-56 w-full object-contain"
              />
              <img
                src={photos[1]}
                alt={`${exercice.name} — position d'arrivée`}
                aria-hidden="true"
                className="photo-alterne absolute inset-0 h-56 w-full object-contain"
              />
            </div>
          </figure>
        )}

        {/* Le matériel ou le montage, quand il y en a un */}
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
