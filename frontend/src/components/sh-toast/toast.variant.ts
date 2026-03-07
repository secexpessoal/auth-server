import { cva } from "class-variance-authority";

// Estilo neutro e fixo para o container do Toast
export const toastContainer =
  "flex items-center gap-3 w-full max-w-md p-4 rounded-xl bg-white shadow-2xl border border-gray-100 transition-all duration-300";

// Variantes aplicadas AGORA AO ÍCONE
export const toastVariants = cva(
  "w-6 h-6 flex-shrink-0", // Tamanho base do ícone
  {
    variants: {
      variant: {
        info: "text-primary",
        warning: "text-secondary",
        error: "text-danger",
        success: "text-success",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);
