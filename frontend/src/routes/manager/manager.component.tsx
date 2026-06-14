import { LogOut, Users, Shield, BookOpen, Briefcase } from "lucide-react";
import { useAuthStore } from "@lib/store/auth.store";
import { logoutAttempt } from "@lib/data/auth/services/auth.service";
import { Button } from "@lib/components/sh-button/button.component";
import { ManagerFormDialog } from "./components/manager-form.component";
import { ManagerTableComponent } from "./components/manager-table.component";
import { ChangePasswordDialog } from "./components/change-password-dialog.component";
import { useNavigate, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@lib/components/sh-theme-toggle/theme-toggle.component";

export function ManagerPage() {
  const navigate = useNavigate();
  const { user, isAdmin, clearAuth } = useAuthStore();

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
            <h1 className="text-3xl font-black text-foreground leading-tight tracking-tight">{isAdmin ? "Gestão de Identidade" : "Dashboard"}</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              {isAdmin ? "Administração centralizada de acessos e permissões" : "Sessão autenticada no servidor de identidade"}
            </p>
            <p className="text-xs font-bold text-primary mt-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> {user?.profile?.username || "Administrador"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ChangePasswordDialog />

            {isAdmin && (
              <>
                <Link to="/positions">
                  <Button
                    variant="outline"
                    className="h-11 px-5 font-bold uppercase text-xs tracking-widest shadow-sm border-primary/20 text-primary hover:bg-primary/5"
                  >
                    Cargos
                    <Briefcase className="w-4 h-4 ml-2 opacity-70" />
                  </Button>
                </Link>

                <Button
                  variant="success"
                  onClick={() => (window.location.href = "/swagger-ui.html")}
                  className="h-11 px-5 font-bold uppercase text-xs tracking-widest shadow-sm"
                >
                  API Docs
                  <BookOpen className="w-4 h-4 ml-2 opacity-70" />
                </Button>
              </>
            )}

            <Button
              variant="destructive"
              className="h-11 px-6 font-black text-xs uppercase tracking-widest shadow-sm"
              onClick={handleLogout}
            >
              Sair
              <LogOut className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {isAdmin ? (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-foreground">Colaboradores do Sistema</h2>
            <div className="flex items-center gap-4">
              <ManagerFormDialog role="USER" />
              <ManagerFormDialog role="ADMIN" />
            </div>
          </div>

          <div className="bg-card rounded-[2.5rem] shadow-neumorph-pressed p-1 border border-white/10">
            <ManagerTableComponent />
          </div>
        </div>
      ) : (
        <section className="bg-card rounded-[2.5rem] shadow-neumorph p-8 sm:p-10 border border-white/20">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-black text-foreground">Sessão ativa</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/5 p-4 dark:bg-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome</span>
                <p className="mt-1 text-sm font-bold text-foreground">{user?.profile?.username || user?.email}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/5 p-4 dark:bg-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cargo</span>
                <p className="mt-1 text-sm font-bold text-foreground">{user?.profile?.position?.name || "Não informado"}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
