import { format, parse } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Date picker (shadcn Calendar + Popover) with the French locale. Stores and
// returns an ISO "yyyy-MM-dd" string (what the API expects); displays it in the
// French format "dd MMMM yyyy".
export function DateField({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const valid = parsed && !Number.isNaN(parsed.getTime())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !valid && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {valid ? format(parsed, 'dd MMMM yyyy', { locale: fr }) : 'Choisir une date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={fr}
          selected={valid ? parsed : undefined}
          onSelect={(d) => d && onChange(format(d, 'yyyy-MM-dd'))}
        />
      </PopoverContent>
    </Popover>
  )
}
