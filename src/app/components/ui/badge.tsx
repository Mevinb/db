import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-purple-500 focus-visible:ring-purple-500/50 focus-visible:ring-2 transition-all duration-200 overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25",
        secondary:
          "border-purple-200 bg-purple-50 text-purple-700",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25",
        outline:
          "border border-purple-200 text-purple-600 bg-white hover:bg-purple-50",
        success:
          "border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25",
        warning:
          "border-transparent bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
