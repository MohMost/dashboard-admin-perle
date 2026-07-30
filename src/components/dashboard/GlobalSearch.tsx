import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Search,
  Ban,
  CheckCircle,
  Check,
  X,
  Trash2,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { membersService } from '@/services/members.service'
import { reviewsService } from '@/services/reviews.service'
import {
  contentService,
  type ContentCollection,
  type ContentRecord,
} from '@/services/content.service'

const COLLECTIONS: ContentCollection[] = [
  'recipes',
  'videos',
  'articles',
  'lives',
  'events',
  'faq',
]
const COLLECTION_LABEL: Record<ContentCollection, string> = {
  recipes: 'Recette',
  videos: 'Vidéo',
  articles: 'Article',
  lives: 'Live',
  events: 'Événement',
  faq: 'FAQ',
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

function contentTitle(r: ContentRecord): string {
  return String(r.title ?? r.q ?? r.name ?? '')
}

// Global search palette: opens from the header, searches members / reviews /
// content and renders grouped results, each row carrying its own actions.
export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 300)
  const q = debounced.trim()
  const enabled = open && q.length >= 2

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const invalidate = (key: string) =>
    queryClient.invalidateQueries({ queryKey: [key] })

  const members = useQuery({
    queryKey: ['search', 'members', q],
    queryFn: () => membersService.getMembers({ search: q, limit: 50 }),
    enabled,
  })
  const reviews = useQuery({
    queryKey: ['search', 'reviews', q],
    queryFn: () => reviewsService.list(),
    enabled,
  })
  const content = useQuery({
    queryKey: ['search', 'content', q],
    queryFn: async () => {
      const lists = await Promise.all(
        COLLECTIONS.map((c) =>
          contentService.list(c).then((rows) =>
            rows.map((r) => ({ collection: c, row: r })),
          ),
        ),
      )
      return lists.flat()
    },
    enabled,
  })

  const memberRows = members.data?.data ?? []
  const reviewRows = (reviews.data ?? []).filter(
    (r) =>
      norm(r.comment).includes(norm(q)) ||
      norm(r.user?.username ?? '').includes(norm(q)),
  )
  const contentRows = (content.data ?? []).filter((c) =>
    norm(contentTitle(c.row)).includes(norm(q)),
  )

  const loading = members.isLoading || reviews.isLoading || content.isLoading
  const totalResults =
    memberRows.length + reviewRows.length + contentRows.length

  const act = async (fn: () => Promise<unknown>, key: string, msg: string) => {
    try {
      await fn()
      invalidate(key)
      toast.success(msg)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur.')
    }
  }

  const reset = () => {
    setQuery('')
    setOpen(false)
  }

  return (
    <>
      {/* Header trigger — looks like a search input, opens the palette. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden md:flex h-8 w-64 items-center rounded-md border bg-transparent pl-9 pr-3 text-left text-sm text-muted-foreground hover:bg-accent"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
        Rechercher...
      </button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : reset())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recherche</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un membre, un avis, un contenu…"
              className="pl-9"
            />
          </div>

          <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
            {q.length < 2 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tapez au moins 2 caractères.
              </p>
            ) : loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : totalResults === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucun résultat pour « {q} ».
              </p>
            ) : (
              <>
                {/* Membres */}
                {memberRows.length > 0 && (
                  <Group title="Membres">
                    {memberRows.map((m) => (
                      <Row
                        key={m.id}
                        title={`@${m.username}`}
                        subtitle={m.status}
                        onOpen={() => {
                          navigate('/dashboard/members')
                          reset()
                        }}
                        actions={
                          <>
                            {m.status === 'active' ? (
                              <IconBtn
                                title="Suspendre"
                                className="text-amber-600"
                                onClick={() =>
                                  act(
                                    () => membersService.suspendMember(m.id),
                                    'members',
                                    'Membre suspendu',
                                  )
                                }
                              >
                                <Ban className="h-4 w-4" />
                              </IconBtn>
                            ) : (
                              <IconBtn
                                title="Activer"
                                className="text-emerald-600"
                                onClick={() =>
                                  act(
                                    () => membersService.activateMember(m.id),
                                    'members',
                                    'Membre activé',
                                  )
                                }
                              >
                                <CheckCircle className="h-4 w-4" />
                              </IconBtn>
                            )}
                            <IconBtn
                              title="Supprimer"
                              className="text-destructive"
                              onClick={() =>
                                act(
                                  () => membersService.deleteMember(m.id),
                                  'members',
                                  'Membre supprimé',
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconBtn>
                          </>
                        }
                      />
                    ))}
                  </Group>
                )}

                {/* Avis */}
                {reviewRows.length > 0 && (
                  <Group title="Avis">
                    {reviewRows.map((r) => (
                      <Row
                        key={r.id}
                        title={`@${r.user?.username ?? '—'} · ${r.rating}★`}
                        subtitle={r.comment}
                        onOpen={() => {
                          navigate('/dashboard/reviews')
                          reset()
                        }}
                        actions={
                          <>
                            {r.status !== 'APPROVED' && (
                              <IconBtn
                                title="Approuver"
                                className="text-emerald-600"
                                onClick={() =>
                                  act(
                                    () =>
                                      reviewsService.moderate(r.id, 'APPROVED'),
                                    'reviews',
                                    'Avis approuvé',
                                  )
                                }
                              >
                                <Check className="h-4 w-4" />
                              </IconBtn>
                            )}
                            {r.status !== 'REJECTED' && (
                              <IconBtn
                                title="Rejeter"
                                className="text-amber-600"
                                onClick={() =>
                                  act(
                                    () =>
                                      reviewsService.moderate(r.id, 'REJECTED'),
                                    'reviews',
                                    'Avis rejeté',
                                  )
                                }
                              >
                                <X className="h-4 w-4" />
                              </IconBtn>
                            )}
                            <IconBtn
                              title="Supprimer"
                              className="text-destructive"
                              onClick={() =>
                                act(
                                  () => reviewsService.remove(r.id),
                                  'reviews',
                                  'Avis supprimé',
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconBtn>
                          </>
                        }
                      />
                    ))}
                  </Group>
                )}

                {/* Contenus */}
                {contentRows.length > 0 && (
                  <Group title="Contenus">
                    {contentRows.map(({ collection, row }) => (
                      <Row
                        key={`${collection}-${row.id}`}
                        title={contentTitle(row)}
                        subtitle={COLLECTION_LABEL[collection]}
                        onOpen={() => {
                          navigate(
                            collection === 'events'
                              ? '/dashboard/events'
                              : '/dashboard/content',
                          )
                          reset()
                        }}
                        actions={
                          <>
                            <IconBtn
                              title="Voir"
                              onClick={() => {
                                navigate(
                                  collection === 'events'
                                    ? '/dashboard/events'
                                    : '/dashboard/content',
                                )
                                reset()
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </IconBtn>
                            <IconBtn
                              title="Supprimer"
                              className="text-destructive"
                              onClick={() =>
                                act(
                                  () =>
                                    contentService.remove(collection, row.id),
                                  'content',
                                  'Contenu supprimé',
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconBtn>
                          </>
                        }
                      />
                    ))}
                  </Group>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="rounded-md border divide-y">{children}</div>
    </div>
  )
}

function Row({
  title,
  subtitle,
  onOpen,
  actions,
}: {
  title: string
  subtitle?: string
  onOpen: () => void
  actions: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </button>
      <div className="flex shrink-0 items-center gap-0.5">{actions}</div>
    </div>
  )
}

function IconBtn({
  title,
  className,
  onClick,
  children,
}: {
  title: string
  className?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      title={title}
      className={className}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
