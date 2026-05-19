import { Button } from "@lib/components/sh-button/button.component";
import { cn } from "@lib/utils/cn/cn.util";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type DialogContentVariantsProps } from "./dialog.prop";
import { dialogContentVariants } from "./dialog.variant";

/**
 * Modal de diálogo baseado em Radix UI. Suporta 9 tamanhos via prop `size` no `DialogContent` e exibe botão de fechar por padrão.
 * Sempre inclua `DialogTitle` para acessibilidade (leitores de tela anunciam o título ao abrir).
 *
 * @example
 * // Dialog básico com cabeçalho e rodapé
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button>Abrir</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Título</DialogTitle>
 *       <DialogDescription>Descrição do dialog.</DialogDescription>
 *     </DialogHeader>
 *     <DialogFooter>
 *       <Button type="submit">Salvar</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 *
 * @example
 * // Dialog sem botão de fechar, tamanho lg
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button>Abrir detalhes</Button>
 *   </DialogTrigger>
 *   <DialogContent size="lg" showCloseButton={false}>
 *     <DialogHeader>
 *       <DialogTitle>Detalhes</DialogTitle>
 *     </DialogHeader>
 *     <DialogFooter showCloseButton>
 *       <Button>Confirmar</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 */
function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

/**
 * @param size - Largura máxima do dialog: `default` (lg), `sm`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`, `full`.
 * @param showCloseButton - Exibe o botão × no canto superior direito (padrão: `true`).
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  size,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> &
  DialogContentVariantsProps & {
    showCloseButton?: boolean;
  }) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content data-slot="dialog-content" className={cn(dialogContentVariants({ size, className }))} {...props}>
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-6 right-6 rounded-full p-2 bg-slate-100/50 hover:bg-slate-200/80 transition-all hover:rotate-90 duration-300 focus:outline-hidden disabled:pointer-events-none [&_svg]:size-5 [&_svg]:text-slate-500"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-3 text-center sm:text-left", className)} {...props} />;
}

/**
 * @param showCloseButton - Adiciona um botão "Fechar" no rodapé que fecha o dialog (padrão: `false`).
 */
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div data-slot="dialog-footer" className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4", className)} {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline" className="rounded-2xl">
            Fechar
          </Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-2xl font-black text-primary tracking-tight", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-slate-500 font-bold text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger };
