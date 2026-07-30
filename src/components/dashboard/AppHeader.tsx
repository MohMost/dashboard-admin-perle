import { useLocation } from 'react-router-dom'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { GlobalSearch } from '@/components/dashboard/GlobalSearch'
import { NotificationsBell } from '@/components/dashboard/NotificationsBell'

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
        <GlobalSearch />
        <NotificationsBell />
      </div>
    </header>
  )
}
