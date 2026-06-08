import { Outlet, createRootRoute, createRoute, createRouter, redirect, useLocation } from "@tanstack/react-router";
import { AppErrorBoundary } from "./errors/error-boundary.component";
import { useAuthStore } from "@lib/store/auth.store";
import { LoginPage } from "@routes/auth/login.component";
import { ResetPasswordPage } from "@routes/auth/reset-password.component";
import { ProfileSetupPage } from "@routes/auth/profile-setup.component";
import { ErrorPage } from "./errors/error.component";
import { ManagerPage } from "@routes/manager/manager.component";
import { PositionsPage } from "@routes/manager/positions.component";
import toast from "react-hot-toast";

const authFlowSearch = (search: Record<string, unknown>): { redirectUri?: string; fromPasswordReset?: boolean } => {
  return {
    redirectUri: typeof search.redirectUri === "string" ? search.redirectUri : undefined,
    fromPasswordReset: search.fromPasswordReset === true || search.fromPasswordReset === "true" ? true : undefined,
  };
};

function ProtectedLayoutContent() {
  const { pathname } = useLocation();
  const isAuthFlowPage = pathname === "/profile-setup" || pathname === "/reset-password";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-500">
      {isAuthFlowPage ? (
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      ) : (
        <main className="flex min-h-screen w-full justify-center p-4 md:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-7xl min-h-[70dvh]">
            <Outlet />
          </div>
        </main>
      )}
    </div>
  );
}

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
    const { isAuthenticated, passwordResetRequired, profileSetupRequired, isAdmin, clearAuth } = useAuthStore.getState();

    if (isAuthenticated) {
      if (passwordResetRequired) {
        throw redirect({ to: "/reset-password" });
      }

      if (profileSetupRequired) {
        throw redirect({ to: "/profile-setup" });
      }

      if (!isAdmin) {
        clearAuth();
        return;
      }

      throw redirect({ to: "/dashboard" });
    }
  },
});

export const protectedLayout = createRoute({
  id: "protected",
  getParentRoute: () => rootRoute,
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isAdmin, passwordResetRequired, profileSetupRequired, clearAuth } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }

    const isResetPage = location.pathname === "/reset-password";
    const isProfileSetupPage = location.pathname === "/profile-setup";

    if (passwordResetRequired && !isResetPage) {
      throw redirect({ to: "/reset-password" });
    }

    if (passwordResetRequired) {
      return;
    }

    if (!passwordResetRequired && isResetPage) {
      throw redirect({ to: profileSetupRequired ? "/profile-setup" : isAdmin ? "/dashboard" : "/login" });
    }

    if (profileSetupRequired && !isProfileSetupPage) {
      throw redirect({ to: "/profile-setup" });
    }

    if (profileSetupRequired) {
      return;
    }

    if (!profileSetupRequired && isProfileSetupPage) {
      throw redirect({ to: isAdmin ? "/dashboard" : "/login" });
    }

    if (!isAdmin) {
      toast.error("Você não tem permissão para acessar este recurso.");

      clearAuth();
      throw redirect({ to: "/login" });
    }
  },
  component: ProtectedLayoutContent,
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
    const { isAuthenticated, isAdmin, passwordResetRequired, profileSetupRequired } = useAuthStore.getState();
    
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }

    if (passwordResetRequired) {
      throw redirect({ to: "/reset-password" });
    }

    if (profileSetupRequired) {
      throw redirect({ to: "/profile-setup" });
    }

    throw redirect({ to: isAdmin ? "/dashboard" : "/login" });
  },
});

export const resetPasswordRoute = createRoute({
  path: "/reset-password",
  component: ResetPasswordPage,
  getParentRoute: () => protectedLayout,
  validateSearch: authFlowSearch,
});

export const profileSetupRoute = createRoute({
  path: "/profile-setup",
  component: ProfileSetupPage,
  getParentRoute: () => protectedLayout,
  validateSearch: authFlowSearch,
});

export const positionsRoute = createRoute({
  path: "/positions",
  component: PositionsPage,
  getParentRoute: () => protectedLayout,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  protectedLayout.addChildren([dashboardRoute, positionsRoute, resetPasswordRoute, profileSetupRoute]),
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
