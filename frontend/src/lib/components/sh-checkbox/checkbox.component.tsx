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
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-lg border transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)_inset] hover:border-border",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="grid place-content-center text-current transition-none">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
