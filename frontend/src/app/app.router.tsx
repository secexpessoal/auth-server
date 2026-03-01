import { Outlet, createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { AppErrorBoundary } from "./errors/error-boundary.component";
import { useAuthStore } from "../store/auth.store";
import { LoginPage } from "../modules/auth/login.page";
import { ResetPasswordPage } from "../modules/auth/reset-password.page";
import { ErrorPage } from "./errors/error.page";
import { UsersPage } from "../modules/users/users.page";
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
      throw redirect({ to: "/" });
    }

    if (!isAdmin && !passwordResetRequired) {
      toast.error("Você não tem permissão para acessar este recurso.");

      clearAuth();
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  ),
});

export const dashboardRoute = createRoute({
  path: "/",
  component: UsersPage,
  getParentRoute: () => protectedLayout,
});

export const resetPasswordRoute = createRoute({
  path: "/reset-password",
  component: ResetPasswordPage,
  getParentRoute: () => protectedLayout,
});

export const routeTree = rootRoute.addChildren([loginRoute, protectedLayout.addChildren([dashboardRoute, resetPasswordRoute])]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultNotFoundComponent: () => <ErrorPage code={404} message="Página não encontrada" />,
});

// NOTE: Subscrição reativa para gerenciar navegação baseada no estado global (Perfec SPA Architecture)
useAuthStore.subscribe(
  (state) => ({
    isAuthenticated: state.isAuthenticated,
    passwordResetRequired: state.passwordResetRequired,
  }),
  ({ isAuthenticated, passwordResetRequired }) => {
    const path = window.location.pathname;

    // Se não estamos autenticados no Zustand, mas existe um token no sessionStorage,
    // ignoramos o redirect pois o Zustand ainda pode estar hidratando (F5).
    const hasPersistentToken = !!sessionStorage.getItem("auth-storage");

    if (!isAuthenticated && !hasPersistentToken && path !== "/login") {
      router.navigate({ to: "/login" });
      return;
    }

    if (isAuthenticated && passwordResetRequired && path !== "/reset-password") {
      router.navigate({ to: "/reset-password" });
      return;
    }

    // Se o estado mudar mas continuarmos na mesma rota, forçamos o Router a revalidar as guardas
    router.invalidate();
  },
);

// Registra as rotas para type safety.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
