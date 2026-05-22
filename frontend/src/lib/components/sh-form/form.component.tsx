import { Label } from "@lib/components/sh-label/label.component";
import { cn } from "@lib/utils/cn/cn.util";
import { Slot } from "radix-ui";
import * as React from "react";
import { Controller, type ControllerProps, type FieldPath, type FieldValues, FormProvider } from "react-hook-form";
import { FormFieldContext, FormItemContext, useFormField } from "./form.hook";

/**
 * Componentes auxiliares para integração com `react-hook-form`. Use `FormField` + `FormControl` para conectar campos ao formulário e `FormMessage` para exibir mensagens de validação.
 * Propaga automaticamente `aria-invalid` e `aria-describedby` nos campos para acessibilidade.
 *
 * @example
 * // Uso básico com um campo de texto
 * const form = useForm<{ name: string }>({ defaultValues: { name: "" } });
 * return (
 *   <Form {...form}>
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       <FormField
 *         control={form.control}
 *         name="name"
 *         render={({ field }) => (
 *           <FormItem>
 *             <FormLabel>Nome</FormLabel>
 *             <FormControl><Input {...field} /></FormControl>
 *             <FormDescription>Informe o nome completo.</FormDescription>
 *             <FormMessage />
 *           </FormItem>
 *         )}
 *       />
 *       <button type="submit">Enviar</button>
 *     </form>
 *   </Form>
 * );
 *
 * @example
 * // Exibindo mensagem de erro via setError
 * useEffect(() => {
 *   form.setError("name", { type: "manual", message: "Campo obrigatório." });
 * }, [form]);
 * // FormMessage renderiza automaticamente o erro quando error está presente.
 */
const Form = FormProvider;

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId();
  const { error } = useFormField();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} {...props} data-invalid={!!error} className={cn("grid gap-2 group", className)} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<React.ComponentRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block transition-colors",
        error && "text-destructive",
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<React.ComponentRef<typeof Slot.Root>, React.ComponentPropsWithoutRef<typeof Slot.Root>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot.Root
      ref={ref}
      {...props}
      id={formItemId}
      aria-invalid={!!error}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return <p ref={ref} id={formDescriptionId} className={cn("text-muted-foreground text-sm", className)} {...props} />;
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        "text-destructive text-[10px] font-bold uppercase tracking-tight mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage };
