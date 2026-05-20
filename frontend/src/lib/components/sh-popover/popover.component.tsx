import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@lib/utils/cn/cn.util";

/**
 * Painel flutuante baseado em Radix UI que abre ao clicar. Use para filtros, formulários inline ou informações contextuais que requerem interação.
 * Fecha com Escape ou clique fora. Diferente do Tooltip que abre no hover.
 *
 * @param open - Controla o estado aberto/fechado de forma controlada.
 * @param defaultOpen - Estado inicial de abertura quando não controlado. Padrão: `false`.
 * @param onOpenChange - Callback disparado quando o estado de abertura muda.
 * @param modal - Quando `true`, bloqueia interações fora do popover enquanto está aberto. Padrão: `true`.
 * @param children - Deve conter `PopoverTrigger` e `PopoverContent`.
 *
 * @example
 * // Popover simples com conteúdo estático
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button variant="outline">Abrir opções</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     <p className="text-sm">Conteúdo contextual aqui.</p>
 *   </PopoverContent>
 * </Popover>
 *
 * @example
 * // Popover controlado externamente
 * const [open, setOpen] = useState(false);
 * <Popover open={open} onOpenChange={setOpen}>
 *   <PopoverTrigger asChild>
 *     <Button>Filtros</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     <Button size="sm" onClick={() => setOpen(false)}>Aplicar</Button>
 *   </PopoverContent>
 * </Popover>
 */
function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({ className, align = "center", sideOffset = 4, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md p-4 shadow-md outline-hidden tactile-border",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
