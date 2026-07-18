import { CollectionManager } from '@/pages/content/ContentCollection'
import { EVENTS_DEF } from '@/pages/content/content-config'

// Dedicated top-level "Événements" page (WIRING_PLAN B2/D4). Reuses the generic
// CollectionManager over the events collection. Lives added under "Contenus"
// appear here automatically (the backend keeps a linked event in sync).
export function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Événements</h1>
        <p className="text-muted-foreground">
          Le calendrier de vos clientes : lives, ateliers, publications et rappels.
          Un rappel (notification) est envoyé sur l'app selon le délai choisi. Les
          lives créés dans « Contenus » apparaissent ici automatiquement.
        </p>
      </div>
      <CollectionManager def={EVENTS_DEF} />
    </div>
  )
}
