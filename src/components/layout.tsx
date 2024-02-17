import { StyledEngineProvider } from "@mui/material";
import { Montserrat } from "next/font/google";
import { type ReactNode } from "react";

export const Font = Montserrat({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const Layout = ({ children }: { children?: ReactNode }) => (
  <StyledEngineProvider injectFirst>
    <main
      className={`flex min-h-screen flex-col gap-8 bg-slate-50 p-4 ${Font.className}`}
    >
      {children}
    </main>
  </StyledEngineProvider>
);
