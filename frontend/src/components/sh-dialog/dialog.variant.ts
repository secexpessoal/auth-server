import { cva } from "class-variance-authority";

export const dialogContentVariants = cva(
  "bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-6 rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl duration-300 outline-none ring-1 ring-slate-900/5",
  {
    variants: {
      size: {
        default: "sm:max-w-lg",
        sm: "sm:max-w-sm",
        lg: "sm:max-w-xl",
        xl: "sm:max-w-2xl",
        "2xl": "sm:max-w-3xl",
        "3xl": "sm:max-w-4xl",
        "4xl": "sm:max-w-5xl",
        "5xl": "sm:max-w-6xl",
        "6xl": "sm:max-w-7xl",
        full: "sm:max-w-[calc(100%-4rem)]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);
