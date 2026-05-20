import { inputVariants } from "./input.variant";
import { type InputProps } from "./input.prop";
import { cn } from "@lib/utils/cn/cn.util";

/**
 * Campo de texto básico. Suporta variantes `default` e `glass` (para fundos escuros translúcidos) e dois tamanhos.
 * Sinalize erros via `aria-invalid`. Sempre associe um `<Label>` para acessibilidade.
 *
 * @param variant - Estilo visual: `"default"` (fundo claro) ou `"glass"` (para fundos escuros translúcidos).
 * @param size - Tamanho: `"default"` (h-12) ou `"sm"` (h-8 compacto).
 * @param type - Tipo HTML do input (text, email, password, number, etc.).
 * @param className - Classes CSS adicionais mescladas via `cn`.
 * @param props - Demais props nativas do elemento `<input>`. Use `aria-invalid` para sinalizar erro.
 *
 * @example
 * // Campo padrão com placeholder
 * <Input placeholder="Digite aqui..." />
 *
 * @example
 * // Campo glass para uso sobre fundos escuros, com erro sinalizado
 * <Input variant="glass" aria-invalid placeholder="Usuário inválido" />
 */
export function Input({ className, variant, size, type, ...props }: InputProps) {
  return <input type={type} data-slot="input" className={cn(inputVariants({ variant, size }), className)} {...props} />;
}
