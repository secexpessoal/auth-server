import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-200",
        success: "bg-success text-white hover:bg-success/90 shadow-lg shadow-success/20 active:scale-[0.98] transition-all duration-200",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/20 active:scale-[0.98] transition-all duration-200",
        outline: "border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all duration-200",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md active:scale-[0.98] transition-all duration-200",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline",
        input:
          "bg-white border-slate-200 text-slate-700 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-[color,border-color,background-color] shadow-sm",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        h12: "h-12 px-5 rounded-2xl",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
