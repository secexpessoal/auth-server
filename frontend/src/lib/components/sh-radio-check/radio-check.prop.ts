import { type VariantProps } from "class-variance-authority";
import type { RadioGroup } from "radix-ui";
import { type radioGroupVariants } from "./radio-check.variant";

export type RadioGroupProps = Omit<React.ComponentProps<typeof RadioGroup.Root>, "variant"> & VariantProps<typeof radioGroupVariants>;
