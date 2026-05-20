import { cva, type VariantProps } from "class-variance-authority";

export const inputVariants = cva(
  "border-input h-12 w-full min-w-0 rounded-xl border bg-transparent px-3 text-base transition-all outline-none file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:border-destructive dark:aria-invalid:ring-destructive/40 dark:aria-invalid:border-destructive/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)_inset]",
  {
    variants: {
      variant: {
        default: "bg-background disabled:opacity-50 border-border/60 hover:border-border",
        glass:
          "bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:border-white/30 focus-visible:ring-white/20 shadow-none",
      },
      size: {
        default: "h-12",
        sm: "h-8 rounded-lg px-2.5 text-xs file:text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type InputVariantsProps = VariantProps<typeof inputVariants>;
