import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#FF4F5A]/50 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "bg-[#0F2A2E] text-white hover:bg-[#1A4851] shadow-md hover:shadow-lg hover:shadow-[#0F2A2E]/20",
        primary:
          "bg-[#FF4F5A] text-white hover:bg-[#e8404a] shadow-md shadow-[#FF4F5A]/25 hover:shadow-lg hover:shadow-[#FF4F5A]/35",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-md shadow-destructive/20 focus-visible:ring-destructive/30",
        outline:
          "border-2 border-border bg-transparent text-foreground hover:bg-muted hover:border-foreground/20 shadow-sm",
        secondary:
          "bg-muted text-foreground hover:bg-muted/70 shadow-sm",
        ghost:
          "bg-transparent text-foreground hover:bg-muted/60 hover:text-foreground",
        glass:
          "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:border-white/40 shadow-lg",
        link:
          "text-[#FF4F5A] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-8 text-xs px-4 has-[>svg]:px-3",
        lg: "h-12 text-base px-7 has-[>svg]:px-5",
        xl: "h-14 text-lg px-8 has-[>svg]:px-6",
        icon: "size-10 shrink-0",
        "icon-sm": "size-8 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
