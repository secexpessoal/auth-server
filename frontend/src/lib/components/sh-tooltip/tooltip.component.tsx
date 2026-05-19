import { cn } from "@lib/utils/cn/cn.util";
import { Tooltip as TooltipPrimitive } from "radix-ui";

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

/**
 * Dica flutuante baseada em Radix UI. Exibida ao passar o mouse (hover) ou focar via teclado. Envolva sempre com `TooltipProvider`.
 * Use `asChild` no `TooltipTrigger` para compor com outros componentes. Não use para informações críticas (não acessível em touch).
 *
 * @param props.open - Controla o estado aberto/fechado de forma controlada.
 * @param props.defaultOpen - Estado inicial aberto (modo não controlado).
 * @param props.onOpenChange - Callback chamado quando o estado de abertura muda.
 *
 * @example
 * // Uso básico com botão
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <Button>Passe o mouse</Button>
 *     </TooltipTrigger>
 *     <TooltipContent>Dica útil</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 *
 * @example
 * // Controlado externamente
 * <TooltipProvider>
 *   <Tooltip open={open} onOpenChange={setOpen}>
 *     <TooltipTrigger asChild>
 *       <span className="underline cursor-help">Termo técnico</span>
 *     </TooltipTrigger>
 *     <TooltipContent>Definição do termo</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 */
function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({ className, sideOffset = 0, children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) bg-foreground text-background",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="size-2.5 rotate-45 rounded-[2px] z-50 translate-y-[calc(-50%-2px)] bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
