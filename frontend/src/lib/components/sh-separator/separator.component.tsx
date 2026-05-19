import { Separator as SeparatorPrimitive } from "radix-ui";

import { cn } from "@lib/utils/cn/cn.util";

/**
 * Divisor visual baseado em Radix UI. Suporta orientação `horizontal` (padrão) e `vertical`.
 * Por padrão é decorativo (`role="none"`); defina `decorative={false}` para expor semântica ao leitor de tela (`role="separator"`).
 *
 * @param orientation - Direção do separador: `"horizontal"` (padrão) ou `"vertical"`.
 * @param decorative - Quando `true` (padrão), oculta o separador do accessibility tree (`role="none"`). Defina `false` para expor `role="separator"`.
 * @param className - Classes CSS adicionais aplicadas ao elemento raiz.
 *
 * @example
 * // Separador horizontal padrão entre duas seções
 * <div>
 *   <p>Seção acima</p>
 *   <Separator className="my-4" />
 *   <p>Seção abaixo</p>
 * </div>
 *
 * @example
 * // Separador vertical entre itens inline com semântica exposta
 * <div className="flex items-center gap-4 h-8">
 *   <span>Item A</span>
 *   <Separator orientation="vertical" decorative={false} />
 *   <span>Item B</span>
 * </div>
 */
function Separator({ className, orientation = "horizontal", decorative = true, ...props }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
