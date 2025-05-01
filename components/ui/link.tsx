import NextLink from "next/link";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface LinkProps extends ComponentPropsWithoutRef<typeof NextLink> {
  className?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <NextLink
        className={cn(
          "text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);

Link.displayName = "Link";
