import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@lib/utils/cn/cn.util";
import { Button } from "@lib/components/sh-button/button.component";
import { Calendar } from "@lib/components/sh-calendar/calendar.component";
import { Popover, PopoverContent, PopoverTrigger } from "@lib/components/sh-popover/popover.component";
import { type DatePickerProps } from "./date-picker.prop";
import { utcDateSchema } from "@lib/utils/schema/date.schema";

/**
 * Seletor de data composto por `Button`, `Popover` e `Calendar`. O valor recebido e emitido usa o formato `YYYY-MM-DD` (string ISO).
 * Suporta restrições de intervalo via `min`/`max` e permite limpar a seleção. Use textos de `placeholder` descritivos para acessibilidade.
 *
 * @param value - Data selecionada no formato `YYYY-MM-DD` ou objeto `Date`. Pode ser `null` para indicar ausência de seleção.
 * @param onChange - Callback chamado ao selecionar ou limpar uma data. Recebe a string `YYYY-MM-DD` ou `null`.
 * @param placeholder - Texto exibido quando nenhuma data está selecionada. Padrão: `"Selecione uma data"`.
 * @param disabled - Quando `true`, desabilita o botão de abertura do calendário.
 * @param className - Classes CSS adicionais aplicadas ao botão de trigger.
 * @param min - Data mínima permitida no formato `YYYY-MM-DD`. Datas anteriores ficam desabilitadas no calendário.
 * @param max - Data máxima permitida no formato `YYYY-MM-DD`. Datas posteriores ficam desabilitadas no calendário.
 *
 * @example
 * // Uso básico com callback de mudança
 * <DatePicker
 *   placeholder="Selecione o prazo"
 *   onChange={(date) => console.log(date)}
 * />
 *
 * @example
 * // Seletor com intervalo restrito e valor inicial
 * <DatePicker
 *   value="2024-06-15"
 *   min="2024-01-01"
 *   max="2024-12-31"
 *   onChange={(date) => setValue(date)}
 * />
 */
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
            "w-full justify-start text-left font-bold h-12 rounded-xl bg-background border border-input transition-all hover:border-primary/30 hover:bg-accent",
            !date && "text-muted-foreground font-semibold",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary/60" />
          <span className="flex-1 truncate">{date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : placeholder}</span>
          {date && !disabled && (
            <X className="ml-2 h-4 w-4 text-muted-foreground hover:text-destructive transition-colors cursor-pointer" onClick={handleClear} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl border border-input shadow-2xl" align="start">
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
