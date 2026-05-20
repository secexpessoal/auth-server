import { cn } from "@lib/utils/cn/cn.util";

/**
 * Indicador de carregamento estilo skeleton com animação `animate-pulse`. Use `className` para controlar dimensões e forma (ex: `h-4 w-64 rounded-full`).
 * Adicione `aria-hidden="true"` nos skeletons para ocultá-los de leitores de tela durante o carregamento.
 *
 * @param className - Classes CSS para controlar largura, altura e forma do skeleton (ex: `h-4 w-64`, `h-12 w-12 rounded-full`).
 * @param props - Demais props nativas do elemento `<div>`.
 *
 * @example
 * // Skeleton de linha de texto
 * <Skeleton className="h-4 w-64" aria-hidden="true" />
 *
 * @example
 * // Skeleton de avatar circular
 * <Skeleton className="h-12 w-12 rounded-full" aria-hidden="true" />
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-accent", className)} {...props} />;
}

export { Skeleton };
