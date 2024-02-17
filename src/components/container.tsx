import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const StyledContainer = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={twMerge(
      "flex flex-col gap-2 rounded-md bg-slate-200 p-4",
      className,
    )}
  >
    {children}
  </div>
);
