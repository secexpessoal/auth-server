import { cn } from "@lib/utils/cn/cn.util";

/**
 * Área de texto com redimensionamento dinâmico via `field-sizing-content`. Suporta estados `disabled` e erro via `aria-invalid`.
 * Sempre associe um `<Label>` via `htmlFor` para acessibilidade.
 *
 * @param className - Classes CSS adicionais mescladas via `cn`.
 * @param props - Demais props nativas do elemento `<textarea>`. Use `aria-invalid` para sinalizar erro, `disabled` para desabilitar e `rows` para definir linhas visíveis.
 *
 * @example
 * // Textarea básico com placeholder
 * <Textarea placeholder="Descreva o motivo da solicitação..." />
 *
 * @example
 * // Textarea com erro sinalizado via aria-invalid
 * <Textarea aria-invalid placeholder="Campo obrigatório" />
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-all outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)_inset] hover:border-border",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
