import { useState, useMemo, useDeferredValue } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  flexRender, type ColumnDef,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, Search, MoreHorizontal, Ban, CheckCircle, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { usersService } from '@/services/users.service'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTablePagination } from '@/components/shared/DataTablePagination'
import { UserFormDialog } from './UserFormDialog'
import { formatDate, formatRelativeTime, getInitials, exportToCSV } from '@/lib/utils'
import { ROLES } from '@/lib/constants'
import type { AdminUser, UserRole, UserStatus } from '@/types'

export function UsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search: deferredSearch, role: roleFilter, status: statusFilter }],
    queryFn: () => usersService.getUsers({ search: deferredSearch, role: roleFilter, status: statusFilter, limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('Utilisateur supprimé') },
    onError: (e: Error) => toast.error(e.message),
  })

  const suspendMutation = useMutation({
    mutationFn: usersService.suspendUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('Utilisateur suspendu') },
  })

  const activateMutation = useMutation({
    mutationFn: usersService.activateUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('Utilisateur activé') },
  })

  const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Utilisateur',
      cell: ({ row: { original: u } }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{getInitials(u.firstName, u.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rôle',
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium">
          {ROLES[row.original.role].label}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'lastLogin',
      header: 'Dernière connexion',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.lastLogin ? formatRelativeTime(row.original.lastLogin) : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Créé le',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      cell: ({ row: { original: u } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditUser(u); setFormOpen(true) }}>Modifier</DropdownMenuItem>
            <DropdownMenuSeparator />
            {u.status === 'active' ? (
              <DropdownMenuItem onClick={() => suspendMutation.mutate(u.id)} className="text-amber-600">
                <Ban className="h-4 w-4 mr-2" />Suspendre
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => activateMutation.mutate(u.id)} className="text-emerald-600">
                <CheckCircle className="h-4 w-4 mr-2" />Activer
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setDeleteId(u.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [suspendMutation, activateMutation])

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les accès et rôles de votre équipe.</p>
        </div>
        <Button onClick={() => { setEditUser(null); setFormOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Nouvel utilisateur
        </Button>
      </div>

      {/* Role distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['super_admin', 'admin', 'editor', 'moderator'] as UserRole[]).map(role => {
          const count = data?.data.filter(u => u.role === role).length ?? 0
          return (
            <div key={role} className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">{ROLES[role].label}</p>
              <p className="text-2xl font-bold mt-1">{count}</p>
            </div>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={v => setRoleFilter(v as UserRole | 'all')}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Rôle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Éditeur</SelectItem>
                <SelectItem value="moderator">Modérateur</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as UserStatus | 'all')}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="suspended">Suspendus</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(data?.data ?? [], 'utilisateurs')} className="ml-auto">
              <Download className="h-4 w-4 mr-2" />Exporter CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(hg => (
                  <TableRow key={hg.id}>
                    {hg.headers.map(h => (
                      <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={i}>
                      {columns.map((_, j) => <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>)}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editUser} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer cet utilisateur ?"
        description="Cet utilisateur perdra tous ses accès au dashboard."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null) } }}
      />
    </div>
  )
}
