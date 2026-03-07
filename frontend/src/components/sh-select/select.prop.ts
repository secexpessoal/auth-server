import { type VariantProps } from "class-variance-authority";
import { type selectTriggerVariants } from "./select.variant";
import type { Select as SelectPrimitive } from "radix-ui";
import type * as React from "react";

export type SelectTriggerProps = Omit<React.ComponentProps<typeof SelectPrimitive.Trigger>, "size"> & VariantProps<typeof selectTriggerVariants>;
