import { type ReactNode, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { queryClient } from "@lib/infra/query/query.util";
import { useAuthStore } from "@lib/store/auth.store";
import { router } from "./router";
import { ThemeProvider } from "./theme.provider";

interface AppProviderProps {
  children?: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
