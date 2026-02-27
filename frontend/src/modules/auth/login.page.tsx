import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Input } from "../../components/sh-input/input.component";
import { Button } from "../../components/sh-button/button.component";
import { Label } from "../../components/sh-label/label.component";
import { loginSchema } from "./molecule/auth.schema";
import { loginAttempt } from "./services/auth.service";
import { getErrorMessage } from "../../lib/api-error/api-error.util";

export function LoginPage() {
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginAttempt,
    onSuccess: (data) => {
      if (data.password_reset_required) {
        toast.error("Você deve alterar sua senha antes de continuar.", { icon: "🔑" });
        navigate({ to: "/reset-password" });
      } else {
        if (data.metadata.role === "ADMIN") {
          toast.success(`Bem-vindo, ${data.metadata.username}!`);
        }

        navigate({ to: "/" });
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Credenciais inválidas. Tente novamente."));
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange({ value }) {
        const result = loginSchema.safeParse(value);
        return result.success ? undefined : "Preencha os campos corretamente";
      },
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="mx-auto bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner mb-4">
            <LogIn className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Painel Admin</h1>
          <p className="text-gray-500 mt-2 text-sm">Faça login para gerenciar o sistema</p>
        </div>

        <form
          onSubmit={(evemt) => {
            evemt.preventDefault();
            evemt.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name} className="ml-1">
                  E-mail
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

                  <Input
                    id={field.name}
                    type="email"
                    className="pl-10"
                    placeholder="admin@exemplo.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>

                {field.state.meta.errors?.length ? (
                  <p className="mt-1.5 text-xs text-red-500 animate-in fade-in">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name} className="ml-1">
                  Senha
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id={field.name}
                    type="password"
                    className="pl-10"
                    placeholder="••••••••"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>

                {field.state.meta.errors?.length ? (
                  <p className="mt-1.5 text-xs text-red-500 animate-in fade-in">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          />

          <Button type="submit" className="w-full h-12 text-lg shadow-primary-500/25" disabled={loginMutation.isPending}>
            {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
