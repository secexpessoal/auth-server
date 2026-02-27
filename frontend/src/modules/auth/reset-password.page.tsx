import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/sh-button/button.component";
import { Input } from "../../components/sh-input/input.component";
import { Label } from "../../components/sh-label/label.component";
import { getErrorMessage } from "@lib/api-error/api-error.util";
import { useAuthStore } from "../../store/auth.store";
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

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: firstChangeSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

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

            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <form.Field
                name="password"
                children={(field) => (
                  <div className="space-y-2 group">
                    <Label htmlFor={field.name} className="ml-1 transition-colors group-focus-within:text-primary-600">
                      Nova Senha
                    </Label>

                    <Input
                      id={field.name}
                      type="password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      className="h-12 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-primary-100"
                    />

                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <form.Field
                name="confirmPassword"
                children={(field) => (
                  <div className="space-y-2 group">
                    <Label htmlFor={field.name} className="ml-1 transition-colors group-focus-within:text-primary-600">
                      Confirmar Nova Senha
                    </Label>

                    <Input
                      id={field.name}
                      type="password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="h-12 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-primary-100"
                    />

                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:hover:scale-100"
                    disabled={!canSubmit || isSubmitting || mutation.isPending}
                  >
                    {isSubmitting || mutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 mr-2" />
                    )}

                    {isSubmitting || mutation.isPending ? "Atualizando..." : "Atualizar e Sair"}
                  </Button>
                )}
              />
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
