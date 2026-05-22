import { LogOut, Users, Shield, BookOpen } from "lucide-react";
import { useAuthStore } from "@lib/store/auth.store";
import { logoutAttempt } from "@lib/data/auth/services/auth.service";
import { Button } from "@lib/components/sh-button/button.component";
import { CreateUserDialog } from "./components/user-form.component";
import { UsersTableComponent } from "./components/users-table.component";
import { ChangePasswordDialog } from "./components/change-password-dialog.component";
import { useNavigate } from "@tanstack/react-router";

export function UsersPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutAttempt();
    } finally {
      clearAuth();
      void navigate({ to: "/login" });
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="bg-card rounded-[2.5rem] shadow-neumorph p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8 border border-white/20">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-card shadow-neumorph-convex rounded-3xl text-primary border border-white/40">
            <Users className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-foreground leading-tight tracking-tight">Gestão de Identidade</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">Administração centralizada de acessos e permissões</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden lg:block pr-4 border-r border-border/40">
            <p className="text-sm font-bold text-foreground">{user?.profile.username || "Administrador"}</p>

            <p className="text-xs text-muted-foreground font-semibold flex items-center justify-end gap-1.5 mt-0.5">
              <Shield className="w-3 h-3 text-primary" /> Painel de Controle
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ChangePasswordDialog />

            <Button
              variant="outline"
              onClick={() => (window.location.href = "/swagger-ui.html")}
              className="h-11 px-5 border-transparent shadow-neumorph-sm hover:shadow-neumorph font-bold"
            >
              API Docs
              <BookOpen className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="destructive"
              className="h-11 px-5 shadow-neumorph-convex hover:shadow-neumorph font-bold"
              onClick={handleLogout}
            >
              Sair
              <LogOut className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-foreground">Colaboradores do Sistema</h2>
          <div className="flex items-center gap-4">
            <CreateUserDialog role="USER" />
            <CreateUserDialog role="ADMIN" />
          </div>
        </div>

        <div className="bg-card rounded-[2.5rem] shadow-neumorph-pressed p-1 border border-white/10">
          <UsersTableComponent />
        </div>
      </div>
    </div>
  );
}
