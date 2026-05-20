import { cn } from "@lib/utils/cn/cn.util";
import { CircleIcon } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type RadioGroupProps } from "./radio-check.prop";
import { radioGroupVariants } from "./radio-check.variant";

/**
 * Grupo de botões de rádio baseado em Radix UI. Suporta variantes de layout `vertical` (padrão) e `horizontal` via prop `variant`.
 * Sempre associe um `<Label>` com `htmlFor` a cada `RadioGroupItem` para acessibilidade completa.
 *
 * @param variant - Layout dos itens: `"vertical"` (padrão) ou `"horizontal"`.
 * @param value - Valor controlado selecionado no grupo.
 * @param defaultValue - Valor selecionado por padrão (modo não controlado).
 * @param disabled - Desabilita todos os itens do grupo quando `true`.
 * @param onValueChange - Callback chamado com o novo valor ao selecionar um item.
 * @param className - Classes CSS adicionais aplicadas ao elemento raiz.
 *
 * @example
 * // Uso básico vertical (padrão)
 * <RadioGroup defaultValue="op1">
 *   <RadioGroupItem value="op1" id="op1" />
 *   <Label htmlFor="op1">Opção 1</Label>
 * </RadioGroup>
 *
 * @example
 * // Variante horizontal controlada
 * <RadioGroup value={selected} onValueChange={setSelected} variant="horizontal">
 *   <RadioGroupItem value="sim" id="sim" />
 *   <Label htmlFor="sim">Sim</Label>
 *   <RadioGroupItem value="nao" id="nao" />
 *   <Label htmlFor="nao">Não</Label>
 * </RadioGroup>
 */
function RadioGroup({ className, variant, value, ...props }: RadioGroupProps) {
  const isControlled = value !== undefined;

  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn(radioGroupVariants({ variant }), className)}
      {...(isControlled ? { value: value ?? "" } : {})}
      {...props}
    />
  );
}

/**
 * Item individual de um `RadioGroup`. Renderiza um botão de rádio estilizado com suporte a estados de foco, erro e desabilitado.
 * Deve sempre ter um `<Label>` associado via `htmlFor`/`id` para acessibilidade.
 *
 * @param value - Valor único que identifica este item dentro do grupo.
 * @param disabled - Desabilita este item individualmente quando `true`.
 * @param className - Classes CSS adicionais aplicadas ao elemento raiz.
 *
 * @example
 * // Item simples dentro de um grupo
 * <RadioGroupItem value="opcao1" id="opcao1" />
 * <Label htmlFor="opcao1">Opção 1</Label>
 *
 * @example
 * // Item desabilitado individualmente
 * <RadioGroupItem value="inativo" id="inativo" disabled />
 * <Label htmlFor="inativo" className="opacity-50 cursor-not-allowed">Indisponível</Label>
 */
function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="relative flex items-center justify-center">
        <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
