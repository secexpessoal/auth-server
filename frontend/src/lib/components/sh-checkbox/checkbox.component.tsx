import { cn } from "@lib/utils/cn/cn.util";
import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

/**
 * Caixa de seleção baseada em Radix UI. Suporta estados controlado e não controlado, `disabled` e erro via `aria-invalid`.
 * Sempre combine com um `<Label>` associado via `htmlFor` para acessibilidade completa.
 *
 * @param className - Classes CSS adicionais mescladas ao estilo base.
 * @param props - Demais props nativas do Radix `Checkbox.Root` (ex.: `disabled`, `checked`, `defaultChecked`, `onCheckedChange`, `aria-invalid`).
 *
 * @example
 * // Checkbox simples com label associado
 * <Checkbox id="termos" />
 * <Label htmlFor="termos">Aceitar termos e condições</Label>
 *
 * @example
 * // Checkbox em estado de erro
 * <Checkbox id="campo" aria-invalid="true" />
 * <Label htmlFor="campo">Campo obrigatório</Label>
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-slate-300 dark:border-white/20 bg-white/50 dark:bg-white/5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-primary focus-visible:ring-primary/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-5 shrink-0 rounded-md border-2 transition-all outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-primary/50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center text-current transition-none">
        <CheckIcon className="size-3.5 stroke-[4px]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
