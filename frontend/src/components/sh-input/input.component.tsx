import * as React from "react";
import { inputVariants } from "./input.variant";
import { type InputProps } from "./input.prop";
import { cn } from "@lib/cn/cn.util";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, variant, size, type, ...props }, ref) => {
  return <input ref={ref} type={type} data-slot="input" className={cn(inputVariants({ variant, size }), className)} {...props} />;
});
Input.displayName = "Input";
