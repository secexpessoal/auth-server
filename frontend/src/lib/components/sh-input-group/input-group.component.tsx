import { type VariantProps } from "class-variance-authority";
import { inputGroupAddonVariants, inputGroupButtonVariants } from "./input-group.variant";
import { cn } from "@lib/utils/cn/cn.util";
import { Button } from "@lib/components/sh-button/button.component";
import { Input } from "@lib/components/sh-input/input.component";
import { Textarea } from "@lib/components/sh-textarea/textarea.component";

/**
 * Grupo visual para inputs com addons (prefixo/sufixo) e botões inline. Use `InputGroupAddon` para ícones ou textos e `InputGroupButton` para ações internas.
 * O foco no grupo é gerenciado automaticamente. O estado de erro é propagado visualmente via `aria-invalid` no controle interno.
 */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex w-full min-w-0 items-center h-12 rounded-md border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md transition-all duration-300 has-[[data-slot=input-group-control]:focus]:border-primary/40 has-[[data-slot=input-group-control]:focus]:bg-white/80 dark:has-[[data-slot=input-group-control]:focus]:bg-white/10 has-[[data-slot][aria-invalid=true]]:border-destructive/50 overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> & VariantProps<typeof inputGroupButtonVariants>) {
  return <Button type={type} data-size={size} variant={variant} className={cn(inputGroupButtonVariants({ size }), className)} {...props} />;
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground gap-2 text-sm [&_svg:not([class*='size-'])]:size-4 flex items-center [&_svg]:pointer-events-none px-3",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  const { size: _, ...rest } = props;
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "h-auto self-center rounded-none border-0 bg-transparent! shadow-none ring-0 focus-visible:ring-0 focus:bg-transparent! disabled:bg-transparent! aria-invalid:ring-0 dark:bg-transparent! dark:disabled:bg-transparent! dark:focus:bg-transparent! backdrop-blur-none! flex-1 px-3",
        "[-webkit-text-fill-color:inherit] [transition:background-color_5000s_ease-in-out_0s]",
        className,
      )}
      {...rest}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent flex-1 resize-none",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea };
