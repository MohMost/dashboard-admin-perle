import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background text-center">
      <div className="space-y-2">
        <h1 className="text-8xl font-extrabold tracking-tight text-foreground/10">404</h1>
        <h2 className="text-2xl font-semibold tracking-tight">Page introuvable</h2>
        <p className="text-muted-foreground max-w-sm">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
        <Button onClick={() => navigate('/dashboard')}>Tableau de bord</Button>
      </div>
    </div>
  )
}
