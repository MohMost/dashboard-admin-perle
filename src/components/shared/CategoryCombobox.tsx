import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { categoriesService } from '@/services/categories.service'
import { ApiError } from '@/lib/api-client'

// Select-or-create category picker. Suggests categories already registered for
// the given scope (recipe/video/article) and, when the typed name is new,
// offers to create it. The chosen value is stored as a plain string (the
// category name), so the content form's serialization is unchanged.
export function CategoryCombobox({
  scope,
  value,
  onChange,
}: {
  scope: string
  value: string
  onChange: (name: string) => void
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', scope],
    queryFn: () => categoriesService.list(scope),
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => categoriesService.create(scope, name),
    onSuccess: (cat) => {
      queryClient.invalidateQueries({ queryKey: ['categories', scope] })
      onChange(cat.name)
      setSearch('')
      setOpen(false)
    },
    onError: (e: Error) =>
      toast.error(e instanceof ApiError ? e.message : 'Échec de la création.'),
  })

  const trimmed = search.trim()
  const exists = categories.some(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
  )

  const select = (name: string) => {
    onChange(name)
    setSearch('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={value ? '' : 'text-muted-foreground'}>
            {value || 'Choisir une catégorie…'}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Rechercher ou créer…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {trimmed ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm"
                  onClick={() => createMutation.mutate(trimmed)}
                  disabled={createMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                  Créer «&nbsp;{trimmed}&nbsp;»
                </button>
              ) : (
                <span className="px-2 py-1.5 text-sm text-muted-foreground">
                  Aucune catégorie
                </span>
              )}
            </CommandEmpty>
            <CommandGroup>
              {categories.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={() => select(c.name)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === c.name ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {c.name}
                </CommandItem>
              ))}
              {trimmed && !exists && (
                <CommandItem
                  value={`__create__${trimmed}`}
                  onSelect={() => createMutation.mutate(trimmed)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer «&nbsp;{trimmed}&nbsp;»
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
