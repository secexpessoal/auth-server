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

type LoginSearch = { redirect?: string; redirectUri?: string };
type AuthFlowSearch = { redirectUri?: string; fromPasswordReset?: boolean };

const getRedirectUriFromHref = (href: string): string | undefined => {
  const queryStart = href.indexOf("?");
  if (queryStart === -1) return undefined;

  return new URLSearchParams(href.slice(queryStart)).get("redirectUri") || undefined;
};

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
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: (search.redirect as string) || undefined,
      redirectUri: typeof search.redirectUri === "string" ? search.redirectUri : undefined,
    };
  },
  beforeLoad: ({ location }) => {
    const { isAuthenticated, passwordResetRequired, profileSetupRequired } = useAuthStore.getState();
    const redirectUri = getRedirectUriFromHref(location.href);
    const flowSearch: AuthFlowSearch | undefined = redirectUri ? { redirectUri } : undefined;

    if (isAuthenticated) {
      if (passwordResetRequired) {
        throw redirect({ to: "/reset-password", search: flowSearch });
      }

      if (profileSetupRequired) {
        throw redirect({ to: "/profile-setup", search: flowSearch });
      }

      if (redirectUri) {
        window.location.replace(redirectUri);
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
    const { isAuthenticated, isAdmin, passwordResetRequired, profileSetupRequired } = useAuthStore.getState();
    console.log("[protectedLayout.beforeLoad]", { path: location.pathname, isAuthenticated, profileSetupRequired, passwordResetRequired, isAdmin });
    const redirectUri = getRedirectUriFromHref(location.href);
    const flowSearch: AuthFlowSearch | undefined = redirectUri ? { redirectUri } : undefined;

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: redirectUri ? { redirectUri } : { redirect: location.href },
      });
    }

    const isResetPage = location.pathname === "/reset-password";
    const isProfileSetupPage = location.pathname === "/profile-setup";
    const isDashboardPage = location.pathname === "/dashboard";

    if (passwordResetRequired && !isResetPage) {
      throw redirect({ to: "/reset-password", search: flowSearch });
    }

    if (passwordResetRequired) {
      return;
    }

    if (!passwordResetRequired && isResetPage) {
      return;
    }

    if (profileSetupRequired && !isProfileSetupPage) {
      console.log("[protectedLayout.beforeLoad] redirecting to /profile-setup");
      throw redirect({ to: "/profile-setup", search: flowSearch });
    }

    if (profileSetupRequired) {
      return;
    }

    if (!profileSetupRequired && isProfileSetupPage) {
      return;
    }

    if (!isAdmin && !isDashboardPage) {
      toast.error("Você não tem permissão para acessar este recurso.");
      throw redirect({ to: "/dashboard" });
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
    const { isAuthenticated, passwordResetRequired, profileSetupRequired } = useAuthStore.getState();
    
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }

    if (passwordResetRequired) {
      throw redirect({ to: "/reset-password" });
    }

    if (profileSetupRequired) {
      throw redirect({ to: "/profile-setup" });
    }

    throw redirect({ to: "/dashboard" });
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
