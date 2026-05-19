import type { VariantProps } from "class-variance-authority";
import type { toastVariants } from "./toast.variant";

export type ToastProps = {
  duration?: number;
  content: React.ReactNode;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
} & VariantProps<typeof toastVariants>;
