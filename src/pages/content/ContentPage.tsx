import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { COLLECTIONS } from './content-config'
import { CollectionManager } from './ContentCollection'
import { FounderEditor, WelcomeMessageEditor } from './ContentSingletons'

// Content management (BACKEND_PLAN.md Task 5b). One tab per content type the
// native app shows, each wired to the backend content CRUD, plus the two
// singleton texts (welcome message, founder).
export function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contenus</h1>
        <p className="text-muted-foreground">
          Gérez le contenu de l'application : recettes, vidéos, articles, lives,
          événements, FAQ et messages.
        </p>
      </div>

      <Tabs defaultValue={COLLECTIONS[0].key}>
        <div className="overflow-x-auto">
          <TabsList>
            {COLLECTIONS.map((c) => (
              <TabsTrigger key={c.key} value={c.key}>
                {c.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="welcome">Message d'accueil</TabsTrigger>
            <TabsTrigger value="founder">Fondatrice</TabsTrigger>
          </TabsList>
        </div>

        {COLLECTIONS.map((c) => (
          <TabsContent key={c.key} value={c.key} className="mt-6">
            <CollectionManager def={c} />
          </TabsContent>
        ))}

        <TabsContent value="welcome" className="mt-6">
          <WelcomeMessageEditor />
        </TabsContent>
        <TabsContent value="founder" className="mt-6">
          <FounderEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
