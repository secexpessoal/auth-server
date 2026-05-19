import { Label as LabelPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@lib/utils/cn/cn.util";

/**
 * Rótulo de campo de formulário baseado em Radix UI Label. Associa-se semanticamente ao controle via `htmlFor`.
 * Reduz automaticamente a opacidade quando o peer está desabilitado. Sempre use junto de um campo de formulário.
 *
 * @param htmlFor - ID do elemento de formulário ao qual o rótulo está associado.
 * @param children - Conteúdo visível do rótulo (texto, ícones, indicador de obrigatório).
 * @param className - Classes CSS adicionais mescladas com as classes padrão.
 *
 * @example
 * // Rótulo simples associado a um input
 * <Label htmlFor="nome">Nome completo</Label>
 * <Input id="nome" placeholder="João da Silva" />
 *
 * @example
 * // Rótulo com indicador de campo obrigatório
 * <Label htmlFor="email">
 *   E-mail <span className="text-destructive">*</span>
 * </Label>
 * <Input id="email" type="email" />
 */
export const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(
  ({ className, ...props }, ref) => {
    return (
      <LabelPrimitive.Root
        ref={ref}
        data-slot="label"
        className={cn(
          "gap-2 text-sm leading-none font-medium group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = "Label";
