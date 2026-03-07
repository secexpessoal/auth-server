import { type VariantProps } from "class-variance-authority";
import { type radioGroupVariants } from "./radio-check.variant";
import type { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type * as React from "react";

export type RadioGroupProps = Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, "variant"> & VariantProps<typeof radioGroupVariants>;
