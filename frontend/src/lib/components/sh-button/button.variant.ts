import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 border border-primary/20",
        success:
          "bg-success text-success-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-success/90 active:scale-[0.98] transition-all duration-200 border border-success/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-destructive/90 active:scale-[0.98] transition-all duration-200 border border-destructive/20",
        outline:
          "border border-input bg-background shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all duration-200 hover:border-accent-foreground/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-secondary/80 active:scale-[0.98] transition-all duration-200 border border-secondary/20",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline",
        input:
          "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground transition-[color,border-color,background-color] shadow-sm",
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
