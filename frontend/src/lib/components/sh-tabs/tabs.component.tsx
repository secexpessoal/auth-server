import { Tabs as TabsPrimitive } from "radix-ui";
import { type VariantProps } from "class-variance-authority";
import { tabsListVariants } from "./tabs.variant";
import { cn } from "@lib/utils/cn/cn.util";

/**
 * Componente de abas baseado em Radix UI. Suporta orientações horizontal e vertical e dois estilos via `variant` na `TabsList`: `default` (fundo sólido) e `line` (sublinhado animado).
 * Sempre defina `defaultValue` ou `value` para controlar a aba ativa. O teclado (setas) navega entre abas automaticamente.
 *
 * @param orientation - Orientação das abas: `"horizontal"` (padrão) ou `"vertical"`.
 * @param className - Classes CSS adicionais aplicadas ao container raiz.
 *
 * @example
 * // Uso básico horizontal
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Aba 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Aba 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Conteúdo da aba 1</TabsContent>
 *   <TabsContent value="tab2">Conteúdo da aba 2</TabsContent>
 * </Tabs>
 *
 * @example
 * // Orientação vertical com variante linha
 * <Tabs defaultValue="tab1" orientation="vertical">
 *   <TabsList variant="line">
 *     <TabsTrigger value="tab1">Aba 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Aba 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Conteúdo</TabsContent>
 *   <TabsContent value="tab2">Conteúdo</TabsContent>
 * </Tabs>
 */
function Tabs({ className, orientation = "horizontal", ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", className)}
      {...props}
    />
  );
}

/**
 * @param variant - Estilo visual da lista de abas: `"default"` (fundo sólido) ou `"line"` (sublinhado animado).
 */
function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return <TabsPrimitive.List data-slot="tabs-list" data-variant={variant} className={cn(tabsListVariants({ variant }), className)} {...props} />;
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:-bottom-1.25 group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
