import { useState, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Download,
  RefreshCw,
  MoreHorizontal,
  Copy,
  Pencil,
  Ban,
  CheckCircle,
  Trash2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { membersService } from "@/services/members.service";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { MemberFormDialog } from "./MemberFormDialog";
import { formatDate, exportToCSV } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import type { Member, MemberStatus } from "@/types";

export function MembersPage() {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedFilter = useDebounce(globalFilter, 350);
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "active">(
    "active",
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["members", { status: statusFilter, search: debouncedFilter }],
    queryFn: () =>
      membersService.getMembers({
        status: statusFilter,
        search: debouncedFilter,
        limit: 200,
      }),
    // Keep showing the previous page's rows while a filter change refetches, so
    // `data` never becomes undefined mid-render (which — combined with a fresh
    // data array — used to trigger react-table's autoReset loop → freeze).
    placeholderData: keepPreviousData,
  });

  // Stable table-data reference: without useMemo, `data?.data ?? []` is a NEW
  // array every render; react-table's autoResetPageIndex then fires a state
  // update each render → infinite loop. Memoizing keeps the empty array (and
  // the loaded array) referentially stable.
  const rows = useMemo(() => data?.data ?? [], [data]);

  const deleteMutation = useMutation({
    mutationFn: membersService.deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Membre supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const suspendMutation = useMutation({
    mutationFn: membersService.suspendMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Membre suspendu");
    },
  });

  const activateMutation = useMutation({
    mutationFn: membersService.activateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Membre activé");
    },
  });

  const regenMutation = useMutation({
    mutationFn: membersService.regenerateCode,
    onSuccess: (m) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      navigator.clipboard.writeText(m.accessCode);
      toast.success(`Code régénéré : ${m.accessCode} (copié)`);
    },
    // Not applicable to the global-code model — surface the backend/service
    // message instead of failing silently.
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: membersService.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setRowSelection({});
      toast.success("Membres supprimés");
    },
  });

  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "username",
        header: "Membre",
        cell: ({ row: { original: m } }) => {
          // Accounts are username-only (privacy). Show the username as the
          // identity; fall back to name/email only if a legacy account has them.
          const fullName = `${m.firstName} ${m.lastName}`.trim();
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {m.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">@{m.username}</p>
                {(fullName || m.email) && (
                  <p className="text-xs text-muted-foreground">
                    {fullName || m.email}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "accessCode",
        header: "Code d'accès",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
              {row.original.accessCode}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(row.original.accessCode);
                toast.success("Copié !");
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Inscription",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row: { original: m } }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditMember(m);
                  setFormOpen(true);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(m.accessCode);
                  toast.success("Code copié");
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier le code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => regenMutation.mutate(m.id)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Régénérer le code
              </DropdownMenuItem>
              {/* "Renvoyer invitation" masqué (aucun envoi d'email réel).
              <DropdownMenuItem
                onClick={() => toast.info("Email d'invitation envoyé (simulé)")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Renvoyer invitation
              </DropdownMenuItem>
              */}
              <DropdownMenuSeparator />
              {m.status === "active" ? (
                <DropdownMenuItem
                  onClick={() => suspendMutation.mutate(m.id)}
                  className="text-amber-600"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspendre
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => activateMutation.mutate(m.id)}
                  className="text-emerald-600"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activer
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setDeleteId(m.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [regenMutation, suspendMutation, activateMutation],
  );

  const table = useReactTable({
    data: rows,
    columns,
    autoResetPageIndex: false,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membres</h1>
          <p className="text-muted-foreground">
            Gérez vos membres et leurs codes d'accès.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditMember(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau membre
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as MemberStatus)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="suspended">Suspendus</SelectItem>
                  <SelectItem value="expired">Expirés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {selectedIds.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.length} sélectionné(s)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(data?.data ?? [], "membres")}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder ? null : (
                          <button
                            className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer hover:text-foreground" : ""}`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </button>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }, (_, i) => (
                    <TableRow key={i}>
                      {columns.map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Aucun membre trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
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

      <MemberFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editMember}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer ce membre ?"
        description="Cette action est irréversible. Toutes les données de ce membre seront supprimées définitivement."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
