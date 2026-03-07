import { Button } from "@components/sh-button/button.component";
import { Input } from "@components/sh-input/input.component";
import { Label } from "@components/sh-label/label.component";
import { getErrorMessage } from "@lib/api-error/api-error.util";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { loginSchema, type LoginFormData } from "./molecule/auth.schema";
import { loginAttempt } from "./services/auth.service";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: loginAttempt,
    onSuccess: (data) => {
      if (data.session.passwordResetRequired) {
        toast.error("Você deve alterar sua senha antes de continuar.", { icon: "🔑" });
        void navigate({ to: "/reset-password" });
      } else {
        if (data.user.roles.includes("ROLE_ADMIN")) {
          toast.success(`Bem-vindo, ${data.user.profile.username}!`);
        }

        void navigate({ to: "/" });
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Credenciais inválidas. Tente novamente."));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    await loginMutation.mutateAsync(values);
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="email" className="ml-1">
              E-mail
            </Label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input id="email" type="email" className="pl-10" placeholder="admin@exemplo.com" {...register("email")} />
            </div>

            {errors.email && <p className="mt-1.5 text-xs text-red-500 animate-in fade-in">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="ml-1">
              Senha
            </Label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-16"
                placeholder="••••••••"
                {...register("password")}
              />

              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errors.password && <p className="mt-1.5 text-xs text-red-500 animate-in fade-in">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full h-12 text-lg shadow-primary-500/25" disabled={loginMutation.isPending}>
            {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
