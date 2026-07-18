import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, flexRender, type ColumnDef, type SortingState,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, Search, Download, MoreHorizontal, Globe, Archive, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { contentService } from '@/services/content.service'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTablePagination } from '@/components/shared/DataTablePagination'
import { ContentFormDialog } from './ContentFormDialog'
import { formatDate, exportToCSV } from '@/lib/utils'
import { CONTENT_TYPES } from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'
import type { ContentItem, ContentStatus, ContentType } from '@/types'

export function ContentPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editContent, setEditContent] = useState<ContentItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['content', { search: debouncedSearch, status: statusFilter, type: typeFilter }],
    queryFn: () => contentService.getContent({ search: debouncedSearch, status: statusFilter, type: typeFilter, limit: 200 }),
    placeholderData: keepPreviousData,
  })

  // Stable reference for react-table (prevents the autoReset render loop that
  // froze the page on filter change — see MembersPage for details).
  const rows = useMemo(() => data?.data ?? [], [data])

  const deleteMutation = useMutation({
    mutationFn: contentService.deleteContent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['content'] }); toast.success('Contenu supprimé') },
    onError: (e: Error) => toast.error(e.message),
  })

  const publishMutation = useMutation({
    mutationFn: contentService.publishContent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['content'] }); toast.success('Contenu publié') },
  })

  const unpublishMutation = useMutation({
    mutationFn: contentService.unpublishContent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['content'] }); toast.success('Contenu dépublié') },
  })

  const archiveMutation = useMutation({
    mutationFn: contentService.archiveContent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['content'] }); toast.success('Contenu archivé') },
  })

  const columns = useMemo<ColumnDef<ContentItem>[]>(() => [
    {
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row: { original: c } }) => (
        <div className="max-w-xs">
          <p className="font-medium text-sm truncate">{c.title}</p>
          <p className="text-xs text-muted-foreground truncate">{c.excerpt}</p>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const t = CONTENT_TYPES.find(t => t.value === row.original.type)
        return <Badge variant="outline" className="text-xs">{t?.label ?? row.original.type}</Badge>
      },
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'categories',
      header: 'Catégories',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          {row.original.categories.slice(0, 2).map(cat => (
            <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
          ))}
          {row.original.categories.length > 2 && (
            <Badge variant="secondary" className="text-xs">+{row.original.categories.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Auteur',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.author}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Créé le',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      cell: ({ row: { original: c } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditContent(c); setFormOpen(true) }}>
              <Eye className="h-4 w-4 mr-2" />Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {c.status !== 'published' && (
              <DropdownMenuItem onClick={() => publishMutation.mutate(c.id)} className="text-emerald-600">
                <Globe className="h-4 w-4 mr-2" />Publier
              </DropdownMenuItem>
            )}
            {c.status === 'published' && (
              <DropdownMenuItem onClick={() => unpublishMutation.mutate(c.id)}>
                <Globe className="h-4 w-4 mr-2" />Dépublier
              </DropdownMenuItem>
            )}
            {c.status !== 'archived' && (
              <DropdownMenuItem onClick={() => archiveMutation.mutate(c.id)}>
                <Archive className="h-4 w-4 mr-2" />Archiver
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeleteId(c.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [publishMutation, unpublishMutation, archiveMutation])

  const table = useReactTable({
    data: rows,
    columns,
    autoResetPageIndex: false,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const stats = useMemo(() => {
    const all = data?.data ?? []
    return {
      total: all.length,
      published: all.filter(c => c.status === 'published').length,
      draft: all.filter(c => c.status === 'draft').length,
      archived: all.filter(c => c.status === 'archived').length,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contenus</h1>
          <p className="text-muted-foreground">Gérez vos articles, tutoriels et ressources.</p>
        </div>
        <Button onClick={() => { setEditContent(null); setFormOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Nouveau contenu
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Publiés', value: stats.published },
          { label: 'Brouillons', value: stats.draft },
          { label: 'Archivés', value: stats.archived },
        ].map(s => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un contenu..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={v => setTypeFilter(v as ContentType | 'all')}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {CONTENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as ContentStatus | 'all')}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="archived">Archivés</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(data?.data ?? [], 'contenus')} className="ml-auto">
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
                  Array.from({ length: 6 }, (_, i) => (
                    <TableRow key={i}>
                      {columns.map((_, j) => <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>)}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                      Aucun contenu trouvé.
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

      <ContentFormDialog open={formOpen} onOpenChange={setFormOpen} content={editContent} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer ce contenu ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null) } }}
      />
    </div>
  )
}
