import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { CategoryCombobox } from "@/components/shared/CategoryCombobox";
import { RichTextField } from "@/components/shared/RichTextField";
import { Skeleton } from "@/components/ui/skeleton";
import { contentService, type ContentRecord } from "@/services/content.service";
import type { CollectionDef, FieldDef } from "./content-config";

type FormValues = Record<string, string | boolean>;

// item field value -> form field value (arrays become newline text)
function buildInitial(
  def: CollectionDef,
  item: ContentRecord | null,
): FormValues {
  const v: FormValues = {};
  for (const f of def.fields) {
    const raw = item?.[f.name];
    if (f.type === "boolean") v[f.name] = Boolean(raw);
    else if (f.type === "linesList")
      v[f.name] = Array.isArray(raw) ? (raw as string[]).join("\n") : "";
    else if (f.type === "keyValueLines")
      v[f.name] = Array.isArray(raw)
        ? (raw as { label: string; qty: string }[])
            .map((r) => `${r.label} | ${r.qty}`)
            .join("\n")
        : "";
    else v[f.name] = raw == null ? "" : String(raw);
  }
  return v;
}

// form values -> API payload (parse numbers / arrays back)
function buildPayload(
  def: CollectionDef,
  values: FormValues,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of def.fields) {
    const val = values[f.name];
    if (f.type === "number") out[f.name] = Number(val === "" ? 0 : val);
    else if (f.type === "boolean") out[f.name] = Boolean(val);
    else if (f.type === "linesList")
      out[f.name] = String(val)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    else if (f.type === "keyValueLines")
      out[f.name] = String(val)
        .split("\n")
        .map((line) => {
          const [label, qty] = line.split("|").map((s) => s.trim());
          return { label: label ?? "", qty: qty ?? "" };
        })
        .filter((r) => r.label);
    // Rich-text HTML must be preserved verbatim (don't .trim() away markup).
    else if (f.type === "richtext") out[f.name] = String(val);
    else out[f.name] = String(val).trim();
  }
  return out;
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string | boolean;
  onChange: (v: string | boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{field.label}</Label>
      {field.type === "boolean" ? (
        <div>
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(v) => onChange(v)}
          />
        </div>
      ) : field.type === "imageUrl" ? (
        <ImageUploadField value={String(value)} onChange={(v) => onChange(v)} />
      ) : field.type === "category" ? (
        <CategoryCombobox
          scope={field.scope ?? ""}
          value={String(value)}
          onChange={(v) => onChange(v)}
        />
      ) : field.type === "richtext" ? (
        <RichTextField value={String(value)} onChange={(v) => onChange(v)} />
      ) : field.type === "select" ? (
        <Select value={String(value)} onValueChange={(v) => onChange(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir…" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "textarea" ||
        field.type === "linesList" ||
        field.type === "keyValueLines" ? (
        <Textarea
          rows={field.type === "textarea" ? 2 : 4}
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          type={field.type === "number" ? "number" : "text"}
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function ContentItemForm({
  def,
  item,
  saving,
  onCancel,
  onSave,
}: {
  def: CollectionDef;
  item: ContentRecord | null;
  saving: boolean;
  onCancel: () => void;
  onSave: (payload: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState<FormValues>(() =>
    buildInitial(def, item),
  );
  const set = (name: string, v: string | boolean) =>
    setValues((prev) => ({ ...prev, [name]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(buildPayload(def, values));
      }}
      className="space-y-4"
    >
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {def.fields.map((f) => (
          <Field
            key={f.name}
            field={f}
            value={values[f.name] ?? ""}
            onChange={(v) => set(f.name, v)}
          />
        ))}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CollectionManager({ def }: { def: CollectionDef }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["content", def.key],
    queryFn: () => contentService.list(def.key),
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ContentRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const rows = data ?? [];

  const save = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editing) await contentService.update(def.key, editing.id, payload);
      else await contentService.create(def.key, payload);
      await queryClient.invalidateQueries({ queryKey: ["content", def.key] });
      toast.success(
        editing ? `${def.singular} modifiée` : `${def.singular} créée`,
      );
      setOpen(false);
      setEditing(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.remove(def.key, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content", def.key] });
      toast.success("Supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle {def.singular}
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {def.columns.map((c) => (
                <TableHead key={c.header} className="whitespace-nowrap">
                  {c.header}
                </TableHead>
              ))}
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => (
                <TableRow key={i}>
                  {def.columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={def.columns.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun contenu. Cliquez sur « Nouvelle {def.singular} » pour
                  commencer.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => (
                <TableRow key={item.id}>
                  {def.columns.map((c) => (
                    <TableCell key={c.header} className="max-w-xs truncate">
                      {c.accessor(item)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditing(item);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => setDeleteId(item.id)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier" : "Nouvelle"} {def.singular}
            </DialogTitle>
          </DialogHeader>
          {open && (
            <ContentItemForm
              def={def}
              item={editing}
              saving={saving}
              onCancel={() => setOpen(false)}
              onSave={save}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer cet élément ?"
        description="Cette action est irréversible."
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
