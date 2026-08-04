import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { COLLECTIONS } from './content-config'
import { CollectionManager } from './ContentCollection'
import {
  AboutEditor,
  FounderEditor,
  LandingEditor,
  LegalEditor,
  WelcomeMessageEditor,
  WhoAmIEditor,
} from './ContentSingletons'

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
            <TabsTrigger value="landing">Écran d'accueil</TabsTrigger>
            <TabsTrigger value="welcome">Mes premiers pas</TabsTrigger>
            <TabsTrigger value="founder">Fondatrice</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="who-am-i">Qui suis-je</TabsTrigger>
            <TabsTrigger value="legal">Mentions légales</TabsTrigger>
          </TabsList>
        </div>

        {COLLECTIONS.map((c) => (
          <TabsContent key={c.key} value={c.key} className="mt-6">
            <CollectionManager def={c} />
          </TabsContent>
        ))}

        <TabsContent value="landing" className="mt-6">
          <LandingEditor />
        </TabsContent>
        <TabsContent value="welcome" className="mt-6">
          <WelcomeMessageEditor />
        </TabsContent>
        <TabsContent value="founder" className="mt-6">
          <FounderEditor />
        </TabsContent>
        <TabsContent value="about" className="mt-6">
          <AboutEditor />
        </TabsContent>
        <TabsContent value="who-am-i" className="mt-6">
          <WhoAmIEditor />
        </TabsContent>
        <TabsContent value="legal" className="mt-6">
          <LegalEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
