import { cva, type VariantProps } from "class-variance-authority";

export const selectTriggerVariants = cva(
  "border-input data-placeholder:text-muted-foreground gap-1.5 rounded-xl border bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors select-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:border-destructive dark:aria-invalid:ring-destructive/40 dark:aria-invalid:border-destructive/50 data-[state=open]:ring-0 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-4 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "dark:bg-input/30 dark:hover:bg-input/50",
        glass: "bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:border-white/30 focus-visible:ring-white/20",
      },
      size: {
        default: "h-12",
        sm: "h-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type SelectTriggerVariantsProps = VariantProps<typeof selectTriggerVariants>;
