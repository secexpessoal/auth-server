import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@lib/cn/cn.util";
import { Button } from "@components/sh-button/button.component";
import { Calendar } from "@components/sh-calendar/calendar.component";
import { Popover, PopoverContent, PopoverTrigger } from "@components/sh-popover/popover.component";
import { type DatePickerProps } from "./date-picker.prop";
import { utcDateSchema } from "@lib/schema/date.schema";

export function DatePicker({ value, onChange, placeholder = "Selecione uma data", disabled, className, min, max }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = React.useMemo(() => {
    const d = utcDateSchema(value);
    if (!d) return undefined;

    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }, [value]);

  const minDate = React.useMemo(() => (min ? new Date(min) : new Date("1900-01-01")), [min]);
  const maxDate = React.useMemo(() => (max ? new Date(max) : new Date("2100-12-31")), [max]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // selectedDate vem como meia-noite local do Calendar.
      // Precisamos enviar para o backend apenas a string YYYY-MM-DD.
      const year = selectedDate.getFullYear();
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");

      const isoDate = `${year}-${month}-${day}`;
      onChange?.(isoDate);
      setOpen(false);
    } else {
      onChange?.(null);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-bold h-12 rounded-xl bg-slate-50 border-slate-200 transition-all hover:border-primary/30 hover:bg-white",
            !date && "text-slate-400 font-semibold",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary/60" />
          <span className="flex-1 truncate">{date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : placeholder}</span>
          {date && !disabled && (
            <X className="ml-2 h-4 w-4 text-slate-400 hover:text-danger transition-colors cursor-pointer" onClick={handleClear} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-2xl" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(d) => (minDate && d < minDate) || (maxDate && d > maxDate) || false}
          initialFocus
          locale={ptBR}
          fromYear={minDate.getFullYear()}
          toYear={maxDate.getFullYear()}
        />
      </PopoverContent>
    </Popover>
  );
}
