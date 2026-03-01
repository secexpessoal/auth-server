import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { queryClient } from "../lib/query/query.util";
import { router } from "./app.router";

interface AppProviderProps {
  children?: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
      {children}
    </QueryClientProvider>
  );
}
