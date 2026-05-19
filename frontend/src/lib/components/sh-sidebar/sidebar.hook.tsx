import * as React from "react";

export type SidebarContextProps = {
  open: boolean;
  isMobile: boolean;
  openMobile: boolean;
  toggleSidebar: () => void;
  state: "expanded" | "collapsed";
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
};

export const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("O parâmetro useSidebar deve ser usado dentro de um SidebarProvider.");
  }

  return context;
}
