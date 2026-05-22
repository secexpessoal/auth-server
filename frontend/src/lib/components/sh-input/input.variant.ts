import { cva, type VariantProps } from "class-variance-authority";

export const inputVariants = cva(
  "h-12 w-full min-w-0 rounded-2xl px-4 text-base transition-all outline-none border border-black/5 dark:border-white/5 placeholder:text-muted-foreground/50 disabled:opacity-50 md:text-sm transition-all duration-300 bg-white/60 dark:bg-white/5 backdrop-blur-md focus:bg-white/80 dark:focus:bg-white/10",
  {
    variants: {
      variant: {
        default: "",
        glass:
          "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 focus:ring-white/10 shadow-none",
      },
      size: {
        default: "h-12",
        sm: "h-8 rounded-xl px-3 text-xs file:text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type InputVariantsProps = VariantProps<typeof inputVariants>;
