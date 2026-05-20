import { type VariantProps } from "class-variance-authority";
import { type inputVariants } from "./input.variant";

export type InputProps = Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>;
