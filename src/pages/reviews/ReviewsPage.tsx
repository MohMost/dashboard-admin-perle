import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Star, Check, Ban, Trash2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import {
  reviewsService,
  type Review,
  type ReviewStatus,
} from '@/services/reviews.service'
import { formatDate } from '@/lib/utils'

const STATUS_LABEL: Record<ReviewStatus, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
}

const STATUS_VARIANT: Record<
  ReviewStatus,
  'secondary' | 'default' | 'destructive'
> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

export function ReviewsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>(
    'PENDING',
  )
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Review | null>(null)

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['reviews', statusFilter],
    queryFn: () =>
      reviewsService.list(statusFilter === 'all' ? undefined : statusFilter),
  })

  const moderateMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: 'APPROVED' | 'REJECTED'
    }) => reviewsService.moderate(id, status),
    onSuccess: (_r, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast.success(status === 'APPROVED' ? 'Avis approuvé' : 'Avis rejeté')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Avis supprimé')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Avis clientes</h1>
        <p className="text-muted-foreground">
          Approuvez ou rejetez les avis avant qu'ils ne soient visibles dans
          l'application.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as ReviewStatus | 'all')
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="APPROVED">Approuvés</SelectItem>
                  <SelectItem value="REJECTED">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Commentaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-40 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }, (_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Aucun avis.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(r)}
                    >
                      <TableCell className="whitespace-nowrap font-medium">
                        @{r.user?.username ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Stars rating={r.rating} />
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm">{r.comment}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[r.status]}>
                          {STATUS_LABEL[r.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-1">
                          {r.status !== 'APPROVED' && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-emerald-600"
                              title="Approuver"
                              onClick={() =>
                                moderateMutation.mutate({
                                  id: r.id,
                                  status: 'APPROVED',
                                })
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {r.status !== 'REJECTED' && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-amber-600"
                              title="Rejeter"
                              onClick={() =>
                                moderateMutation.mutate({
                                  id: r.id,
                                  status: 'REJECTED',
                                })
                              }
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            title="Supprimer"
                            onClick={() => setDeleteId(r.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Full-review detail with moderation actions in the footer. */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>@{selected.user?.username ?? '—'}</span>
                  <Badge variant={STATUS_VARIANT[selected.status]}>
                    {STATUS_LABEL[selected.status]}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Stars rating={selected.rating} />
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {selected.comment}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(selected.createdAt)}
                </p>
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    setDeleteId(selected.id)
                    setSelected(null)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
                <div className="flex gap-2">
                  {selected.status !== 'REJECTED' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        moderateMutation.mutate({
                          id: selected.id,
                          status: 'REJECTED',
                        })
                        setSelected(null)
                      }}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  )}
                  {selected.status !== 'APPROVED' && (
                    <Button
                      onClick={() => {
                        moderateMutation.mutate({
                          id: selected.id,
                          status: 'APPROVED',
                        })
                        setSelected(null)
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer cet avis ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId)
            setDeleteId(null)
          }
        }}
      />
    </div>
  )
}
