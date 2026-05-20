import { type VariantProps } from "class-variance-authority";
import type { Select } from "radix-ui";
import { type selectTriggerVariants } from "./select.variant";

export type SelectTriggerProps = Omit<React.ComponentProps<typeof Select.Trigger>, "size"> & VariantProps<typeof selectTriggerVariants>;
