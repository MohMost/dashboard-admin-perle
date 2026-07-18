import { useLocation, Link } from 'react-router-dom'
import {
  // LayoutDashboard, // used only by the disabled "Vue d'ensemble" analytics nav item
  // Users, // used only by the disabled "Utilisateurs" (admin users) nav item
  UserCheck, FileText, Settings, Sparkles, LogOut, ChevronRight,
} from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth.store'
import { getInitials } from '@/lib/utils'
import { ROLES } from '@/lib/constants'
import { ModeToggle } from '@/components/mode-toggle'

const navItems = [
  // Analytics overview ("Vue d'ensemble") removed at client request (2026-07-18)
  // — not deleted, just hidden from the nav. The /dashboard index redirects to
  // /dashboard/members while disabled. Restore this entry to bring it back.
  // { title: 'Vue d\'ensemble', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Membres', href: '/dashboard/members', icon: UserCheck },
  // "Utilisateurs" (admin/team accounts) hidden at client request (2026-07-18) —
  // the app has a single admin and "Membres" (native-app users in the DB) is the
  // relevant list. Not deleted; restore this line + the /users route to bring back.
  // { title: 'Utilisateurs', href: '/dashboard/users', icon: Users },
  { title: 'Contenus', href: '/dashboard/content', icon: FileText },
  { title: 'Paramètres', href: '/dashboard/settings', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background shrink-0">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-sm">Perle de Lys</span>
                  <span className="text-xs text-muted-foreground">Administration</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link to={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <ModeToggle />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-auto py-2">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {user ? getInitials(user.firstName, user.lastName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none min-w-0">
                <span className="font-medium text-sm truncate">
                  {user?.firstName} {user?.lastName}
                </span>
                <Badge variant="secondary" className="w-fit text-xs py-0">
                  {user ? ROLES[user.role].label : ''}
                </Badge>
              </div>
              <ChevronRight className="ml-auto size-4 text-muted-foreground shrink-0" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive"
              tooltip="Déconnexion"
            >
              <LogOut />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
