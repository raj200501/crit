import type { ElementType, ReactNode } from "react";
import { cn } from "./cn";

const SIZES = {
  page: "max-w-[1240px]",
  prose: "max-w-[68ch]",
  wide: "max-w-[1440px]",
} as const;

export interface ContainerProps {
  size?: keyof typeof SIZES;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

/** Page gutters (16/24/32 px, same as the container-page utility) plus a max width: page 1240, prose 68ch, wide 1440. */
export function Container({ size = "page", as: Tag = "div", className, children }: ContainerProps) {
  return <Tag className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", SIZES[size], className)}>{children}</Tag>;
}
