import { cva, type VariantProps } from "class-variance-authority";

export const radioGroupVariants = cva("grid", {
  variants: {
    variant: {
      vertical: "gap-3",
      horizontal: "flex flex-row items-center gap-6 h-12",
    },
  },
  defaultVariants: {
    variant: "vertical",
  },
});

export type RadioGroupVariantsProps = VariantProps<typeof radioGroupVariants>;
