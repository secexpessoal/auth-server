import { Loader2Icon } from "lucide-react";

import { cn } from "@lib/utils/cn/cn.util";

/**
 * Indicador de carregamento animado usando o ícone `Loader2` do Lucide. Possui `role="status"` e `aria-label="Loading"` para acessibilidade.
 * Use `className` para controlar cor e tamanho (ex: `size-8 text-primary`).
 *
 * @param className - Classes CSS adicionais para tamanho e cor (ex: `size-8 text-primary`).
 * @param props - Demais atributos SVG nativos repassados ao elemento raiz.
 *
 * @example
 * // Spinner padrão
 * <Spinner />
 *
 * @example
 * // Spinner grande na cor primária
 * <Spinner className="size-8 text-primary" />
 */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return <Loader2Icon role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />;
}

export { Spinner };
