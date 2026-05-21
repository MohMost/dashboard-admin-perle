import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success('Connexion réussie')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de connexion')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-background/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-background/10 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-background" />
            </div>
            <span className="text-background font-semibold text-xl tracking-tight">Perle de Lys</span>
          </div>
        </div>
        <div className="relative space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-background leading-tight">
              Bienvenue sur votre<br />espace administration
            </h2>
            <p className="text-background/60 text-lg leading-relaxed">
              Gérez vos membres, votre contenu et vos paramètres depuis un seul endroit.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Membres', value: '80+' },
              { label: 'Contenus', value: '15+' },
              { label: 'Actifs', value: '64' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl bg-background/10 p-4">
                <div className="text-2xl font-bold text-background">{stat.value}</div>
                <div className="text-sm text-background/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-background/40 text-sm relative">
          © 2025 Perle de Lys. Tous droits réservés.
        </p>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 lg:hidden mb-6">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <span className="font-semibold text-lg">Perle de Lys</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Connexion</h1>
            <p className="text-muted-foreground">Accédez à votre tableau de bord administrateur</p>
          </div>

          {/* Demo hints */}
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Comptes de démonstration :</p>
            <p>superadmin@perledelys.fr / admin123</p>
            <p>editor@perledelys.fr / admin123</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.fr"
                  className={cn('pl-10', errors.email && 'border-destructive')}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn('pl-10 pr-10', errors.password && 'border-destructive')}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={v => setValue('rememberMe', !!v)}
              />
              <Label htmlFor="rememberMe" className="font-normal text-muted-foreground cursor-pointer">
                Se souvenir de moi
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
