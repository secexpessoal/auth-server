import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] transition-all duration-200 border border-primary/10",
        success:
          "bg-success text-success-foreground shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] transition-all duration-200 border border-success/10",
        warning:
          "bg-warning text-warning-foreground shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] transition-all duration-200 border border-warning/10",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] transition-all duration-200 border border-destructive/10",
        outline:
          "border border-border/40 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:translate-y-[1px] transition-all duration-200",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 border border-secondary/10",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline",
        input:
          "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground transition-[color,border-color,background-color] shadow-sm",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        h12: "h-12 px-5 rounded-md",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
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
