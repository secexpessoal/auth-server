import { type VariantProps } from "class-variance-authority";
import { type inputVariants } from "./input.variant";
import type * as React from "react";

export type InputProps = Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>;
