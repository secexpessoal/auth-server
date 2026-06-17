import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@lib/components/sh-button/button.component";
import { Dialog, DialogContent, DialogHeader } from "@lib/components/sh-dialog/dialog.component";
import { Field, FieldContent } from "@lib/components/sh-field/field.component";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@lib/components/sh-form/form.component";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@lib/components/sh-input-group/input-group.component";
import type { LoginFormData, ResetPasswordFormData } from "@lib/data/auth/molecule/auth.schema";
import { loginSchema, resetPasswordSchema } from "@lib/data/auth/molecule/auth.schema";
import { loginAttempt, resetPasswordAttempt } from "@lib/data/auth/services/auth.service";
import { toastApiError, toastValidationFieldErrors } from "@lib/utils/api-error/api-error.util";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useAuthStore } from "@lib/store/auth.store";
import { ThemeToggle } from "@lib/components/sh-theme-toggle/theme-toggle.component";

export function LoginPage() {
  const navigate = useNavigate();
  const redirectUri = new URLSearchParams(window.location.search).get("redirectUri") || undefined;
  const [showPassword, setShowPassword] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: loginAttempt,
    onSuccess: (data) => {
      console.log("[login.onSuccess] profileSetupRequired:", data.session.profileSetupRequired, "passwordResetRequired:", data.session.passwordResetRequired);
      console.log("[login.onSuccess] data.redirectUri:", data.redirectUri, "urlRedirectUri:", redirectUri);
      const targetRedirectUri = data.redirectUri || redirectUri;
      console.log("[login.onSuccess] targetRedirectUri:", targetRedirectUri);

      if (data.session.passwordResetRequired) {
        setAuth(data.session, data.user);
        console.log("[login.onSuccess] after setAuth, store:", useAuthStore.getState().profileSetupRequired);

        toast.error("Você deve alterar sua senha antes de continuar.");
        void navigate({
          to: "/reset-password",
          search: targetRedirectUri ? { redirectUri: targetRedirectUri } : {},
        });
        return;
      }

      if (targetRedirectUri) {
        setIsRedirecting(true);
        // NOTE: Usamos replace para não sujar o histórico e evitar que o usuário volte para o login logado.
        // Não chamamos setAuth para evitar que o TanStack Router tente processar rotas protegidas antes da saída.
        window.location.replace(targetRedirectUri);
        return;
      }

      if (data.user.roles.includes("ROLE_ADMIN")) {
        toast.success(`Bem-vindo, ${data.user.profile?.username || "Administrador"}!`);
      }

      setAuth(data.session, data.user);
      void navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      if (toastValidationFieldErrors(error, {
        email: "E-mail corporativo",
        password: "Senha",
      })) {
        return;
      }

      toastApiError(error, "Credenciais inválidas. Tente novamente.");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => resetPasswordAttempt(email),
    onSuccess: () => {
      toast.success("Se o e-mail existir, uma nova senha foi enviada.", { duration: 5000 });
      setIsResetDialogOpen(false);
    },
    onError: (error) => {
      if (toastValidationFieldErrors(error, {
        email: "E-mail de cadastro",
      })) {
        return;
      }

      toastApiError(error, "Ocorreu um erro ao processar sua solicitação.");
    },
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    await loginMutation.mutateAsync({ ...values, redirectUri });
  };

  const onResetSubmit = async (values: ResetPasswordFormData) => {
    await resetPasswordMutation.mutateAsync(values.email);
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Redirecionando...</h2>
        <p className="text-gray-500">Você está sendo levado de volta para o sistema.</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* Background Decor */}
        <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700"></div>

        <div className="w-full max-w-lg relative z-10">
          <div className="bg-card rounded-[3rem] shadow-neumorph p-8 md:p-12 border border-white/20 transition-all duration-500">
            <div className="text-center mb-12">
              <div className="mx-auto bg-card shadow-neumorph-convex w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border border-white/40">
                <LogIn className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Login</h1>
              <p className="text-muted-foreground text-sm font-medium">Gestão Centralizada de Identidade</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel className="text-foreground/80 font-bold ml-1">E-mail Corporativo</FormLabel>
                        <FieldContent>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon>
                                <InputGroupText>
                                  <Mail className="w-5 h-5 opacity-60" />
                                </InputGroupText>
                              </InputGroupAddon>
                              <InputGroupInput
                                {...field}
                                type="email"
                                placeholder="colaborador@empresa.com"
                                disabled={isResetDialogOpen || loginMutation.isPending}
                              />
                            </InputGroup>
                          </FormControl>
                        </FieldContent>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <Field>
                          <FormLabel className="text-foreground/80 font-bold ml-1">Senha de Acesso</FormLabel>
                          <FieldContent>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon>

                                  <InputGroupText>
                                    <Lock className="w-5 h-5 opacity-60" />
                                  </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  disabled={isResetDialogOpen || loginMutation.isPending}
                                />

                                <InputGroupAddon align="inline-end">
                                  <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 p-2"
                                    disabled={isResetDialogOpen || loginMutation.isPending}
                                  >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </InputGroupAddon>
                              </InputGroup>
                            </FormControl>
                          </FieldContent>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pr-1">
                    <button
                      type="button"
                      onClick={() => setIsResetDialogOpen(true)}
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-all hover:underline underline-offset-4 cursor-pointer disabled:opacity-50"
                      disabled={loginMutation.isPending}
                    >
                      Recuperar credenciais?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="h12"
                  className="w-full text-xl font-bold rounded-md"
                  disabled={isResetDialogOpen || loginMutation.isPending}
                >
                  {loginMutation.isPending && <Loader2 className="mr-3 h-6 w-6 animate-spin" />}
                  Acessar Painel
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog - MOVED OUTSIDE OF MAIN FORM */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent size="sm" className="rounded-[2.5rem] border-white/20 bg-card shadow-neumorph backdrop-blur-3xl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto bg-card shadow-neumorph-convex w-14 h-14 rounded-2xl flex items-center justify-center mb-2 border border-white/40">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-center text-foreground">Recuperar Acesso</h1>
            <p className="text-center text-muted-foreground font-medium">Insira o e-mail registrado para receber as instruções de recuperação.</p>
          </DialogHeader>

          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6 mt-6">
              <FormField
                control={resetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel className="text-foreground/80 font-bold ml-1">E-mail de Cadastro</FormLabel>

                      <FieldContent>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon>

                              <InputGroupText>
                                <Mail className="w-5 h-5 opacity-60" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput {...field} type="email" placeholder="colaborador@empresa.com" />
                          </InputGroup>
                        </FormControl>
                      </FieldContent>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="h12"
                className="w-full text-lg font-bold rounded-md shadow-sm"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Enviar Solicitação
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
