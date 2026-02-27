import { LogOut, Users, Shield } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { logoutAttempt } from "../auth/services/auth.service";
import { Button } from "../../components/button.component";
import { CreateUserDialog } from "./user-form.component";
import { UsersTableComponent } from "./molecule/users-table.component";

export function UsersPage() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await logoutAttempt();
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100/50 rounded-xl text-primary-600">
            <Users className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Gestão de Autenticação</h1>
            <p className="text-sm text-gray-500">Listagem de contas e criação de usuários</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.username || "Admin"}</p>

            <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
              <Shield className="w-3 h-3 text-emerald-500" /> Administrador
            </p>
          </div>

          <Button
            variant="outline"
            className="h-10 border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
            onClick={handleLogout}
          >
            Sair
            <LogOut className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-end gap-3">
          <CreateUserDialog role="USER" />
          <CreateUserDialog role="ADMIN" />
        </div>

        <UsersTableComponent />
      </div>
    </div>
  );
}
