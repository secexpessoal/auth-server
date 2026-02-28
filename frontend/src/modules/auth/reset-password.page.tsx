import { Button } from "@components/sh-button/button.component";
import { Input } from "@components/sh-input/input.component";
import { Label } from "@components/sh-label/label.component";
import { getErrorMessage } from "@lib/api-error/api-error.util";
import { useAuthStore } from "@store/auth.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { firstChangeSchema, type FirstChangeFormData } from "./molecule/auth.schema";
import { firstChangePasswordAttempt } from "./services/auth.service";

export function ResetPasswordPage() {
  const { isAuthenticated, passwordResetRequired, user } = useAuthStore();

  const mutation = useMutation({
    mutationFn: (data: FirstChangeFormData) => firstChangePasswordAttempt(data.password),
    onSuccess: () => {
      toast.success("Senha atualizada com sucesso! Por favor, faça login com sua nova senha.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erro ao atualizar senha. Tente novamente."));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FirstChangeFormData>({
    resolver: zodResolver(firstChangeSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: FirstChangeFormData) => {
    mutation.mutate(values);
  };

  // Protected Route Logic: If not authenticated or reset not required, redirect home
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!passwordResetRequired) return <Navigate to="/" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 selection:bg-primary-100 italic-selection">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-500 hover:shadow-2xl">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-5 animate-pulse-subtle">
                <KeyRound className="w-8 h-8 text-primary-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Definir Nova Senha</h1>

              <p className="text-gray-500">
                Olá, <span className="font-semibold text-gray-900">{user?.profile.username}</span>.
                <br />
                Para sua segurança, você deve definir uma nova senha personalizada.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2 group">
                <Label htmlFor="password" className="ml-1 transition-colors group-focus-within:text-primary-600">
                  Nova Senha
                </Label>

                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="h-12 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-primary-100"
                />

                {errors.password && (
                  <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="confirmPassword" className="ml-1 transition-colors group-focus-within:text-primary-600">
                  Confirmar Nova Senha
                </Label>

                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="h-12 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-primary-100"
                />

                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:hover:scale-100"
                disabled={!isValid || isSubmitting || mutation.isPending}
              >
                {isSubmitting || mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}

                {isSubmitting || mutation.isPending ? "Atualizando..." : "Atualizar e Sair"}
              </Button>
            </form>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-medium tracking-wide flex items-center justify-center gap-2">
              Acesso Protegido • Sistema de Autenticação • 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
