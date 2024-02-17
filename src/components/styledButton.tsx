import { ButtonBase, type ButtonBaseProps } from "@mui/material";
import { twMerge } from "tailwind-merge";

export const StyledButton = ({
  className,
  children,
  ...props
}: ButtonBaseProps) => (
  <ButtonBase
    {...props}
    className={twMerge(
      "rounded-md bg-slate-300 p-2 font-medium hover:bg-slate-400/45",
      className ?? "",
    )}
  >
    {children}
  </ButtonBase>
);
