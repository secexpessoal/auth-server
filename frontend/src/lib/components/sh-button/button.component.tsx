import { type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@lib/utils/cn/cn.util";
import { buttonVariants } from "./button.variant";

/**
 * Botão de ação principal. Suporta 8 variantes (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `success`, `input`) e 9 tamanhos.
 * Use `asChild` para compor com elementos nativos como `<a>` ou `<Link>`. Sempre forneça um texto ou `aria-label` acessível.
 *
 * @param variant - Estilo visual do botão. Padrão: `"default"`.
 * @param size - Tamanho do botão. Padrão: `"default"`.
 * @param asChild - Quando `true`, renderiza o filho direto via Slot em vez de `<button>`.
 * @param className - Classes CSS adicionais mescladas ao estilo base.
 * @param props - Demais props nativas de `<button>` (ex.: `disabled`, `onClick`, `aria-label`).
 *
 * @example
 * // Botão de confirmação simples
 * <Button>Salvar</Button>
 *
 * @example
 * // Botão destrutivo desabilitado
 * <Button variant="destructive" disabled>Excluir</Button>
 */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return <Comp data-slot="button" data-variant={variant} data-size={size} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button };
