import { Outlet, createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { AppErrorBoundary } from "./errors/error-boundary.component";
import { useAuthStore } from "@lib/store/auth.store";
import { LoginPage } from "@routes/auth/login.component";
import { ResetPasswordPage } from "@routes/auth/reset-password.component";
import { ErrorPage } from "./errors/error.component";
import { ManagerPage } from "@routes/manager/manager.component";
import toast from "react-hot-toast";

export const rootRoute = createRootRoute({
  validateSearch: (search: Record<string, unknown>): { error_code?: number } => {
    return {
      error_code: Number(search.error_code) || undefined,
    };
  },
  component: () => {
    const { error_code } = rootRoute.useSearch();

    if (error_code) {
      return <ErrorPage code={error_code} message={error_code === 404 ? "Página não encontrada" : "Ocorreu um erro no servidor"} />;
    }

    return (
      <AppErrorBoundary>
        <Outlet />
      </AppErrorBoundary>
    );
  },
});

export const loginRoute = createRoute({
  path: "/login",
  component: LoginPage,
  getParentRoute: () => rootRoute,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
});

export const protectedLayout = createRoute({
  id: "protected",
  getParentRoute: () => rootRoute,
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isAdmin, passwordResetRequired, clearAuth } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }

    // NOTE: Força o usuário a resetar a senha.
    const isResetPage = location.pathname === "/reset-password";

    if (passwordResetRequired && !isResetPage) {
      throw redirect({ to: "/reset-password" });
    }

    if (!passwordResetRequired && isResetPage) {
      throw redirect({ to: "/dashboard" });
    }

    if (!isAdmin && !passwordResetRequired) {
      toast.error("Você não tem permissão para acessar este recurso.");

      clearAuth();
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-500">
      <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  ),
});

export const dashboardRoute = createRoute({
  path: "/dashboard",
  component: ManagerPage,
  getParentRoute: () => protectedLayout,
});

export const indexRoute = createRoute({
  path: "/",
  getParentRoute: () => rootRoute,
  beforeLoad: () => {
    const { isAuthenticated, isAdmin } = useAuthStore.getState();
    
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }

    throw redirect({ to: isAdmin ? "/dashboard" : "/login" });
  },
});

export const resetPasswordRoute = createRoute({
  path: "/reset-password",
  component: ResetPasswordPage,
  getParentRoute: () => protectedLayout,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  protectedLayout.addChildren([dashboardRoute, resetPasswordRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultNotFoundComponent: () => <ErrorPage code={404} message="Página não encontrada" />,
});

// Registra as rotas para type safety.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
