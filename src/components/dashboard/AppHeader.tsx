import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const breadcrumbMap: Record<string, { parent?: { label: string; href: string }; label: string }> = {
  '/dashboard': { label: 'Vue d\'ensemble' },
  '/dashboard/members': { parent: { label: 'Dashboard', href: '/dashboard' }, label: 'Membres' },
  '/dashboard/users': { parent: { label: 'Dashboard', href: '/dashboard' }, label: 'Utilisateurs' },
  '/dashboard/content': { parent: { label: 'Dashboard', href: '/dashboard' }, label: 'Contenus' },
  '/dashboard/settings': { parent: { label: 'Dashboard', href: '/dashboard' }, label: 'Paramètres' },
}

export function AppHeader() {
  const { pathname } = useLocation()
  const crumb = breadcrumbMap[pathname] ?? { label: 'Page' }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4 mr-1" />

      <Breadcrumb>
        <BreadcrumbList>
          {crumb.parent && (
            <>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={crumb.parent.href}>{crumb.parent.label}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 w-64 h-8" />
        </div>
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
          </Button>
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
            3
          </Badge>
        </div>
      </div>
    </header>
  )
}
