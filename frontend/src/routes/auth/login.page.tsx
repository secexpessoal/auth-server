import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@lib/components/sh-dialog/dialog.component";
import { Field, FieldContent } from "@lib/components/sh-field/field.component";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@lib/components/sh-form/form.component";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from "@lib/components/sh-input-group/input-group.component";
import { Button } from "@lib/components/sh-button/button.component";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@lib/utils/api-error/api-error.util";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { LoginFormData, ResetPasswordFormData } from "@lib/data/auth/molecule/auth.schema";
import { loginSchema, resetPasswordSchema } from "@lib/data/auth/molecule/auth.schema";
import { loginAttempt, resetPasswordAttempt } from "@lib/data/auth/services/auth.service";

export function LoginPage() {
  const navigate = useNavigate();
  const redirectUri = new URLSearchParams(window.location.search).get("rd") || undefined;
  const [showPassword, setShowPassword] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

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

        if (data.redirectUri) {
          window.location.href = data.redirectUri;
        } else {
          void navigate({ to: "/" });
        }
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Credenciais inválidas. Tente novamente."));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => resetPasswordAttempt(email),
    onSuccess: () => {
      toast.success("Se o e-mail existir, uma nova senha foi enviada.", { duration: 5000 });
      setIsResetDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Ocorreu um erro ao processar sua solicitação."));
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Field>
                    <FormLabel>E-mail</FormLabel>
                    <FieldContent>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>
                              <Mail />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            {...field}
                            type="email"
                            placeholder="admin@exemplo.com"
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

            <div className="space-y-1">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel>Senha</FormLabel>
                      <FieldContent>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon>
                              <InputGroupText>
                                <Lock />
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
                                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsResetDialogOpen(true)}
                  className="text-xs font-semibold text-primary/90 hover:text-primary transition-colors hover:underline underline-offset-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loginMutation.isPending}
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg shadow-primary/25" disabled={isResetDialogOpen || loginMutation.isPending}>
              {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </Form>

        {/* Forgot Password Dialog - MOVED OUTSIDE OF MAIN FORM */}
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogContent size="sm" className="rounded-3xl border-border/40 bg-card/95 backdrop-blur-2xl shadow-huge">
            <DialogHeader className="space-y-3">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-2">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">Recuperar Senha</DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Digite seu e-mail abaixo. Se ele estiver em nossa base, enviaremos uma nova senha temporária.
              </DialogDescription>
            </DialogHeader>

            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5 mt-4">
                <FormField
                  control={resetForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel className="text-foreground/80">E-mail cadastrado</FormLabel>
                        <FieldContent>
                          <FormControl>
                            <InputGroup className="bg-background/50">
                              <InputGroupAddon>
                                <InputGroupText>
                                  <Mail className="w-4 h-4 opacity-70" />
                                </InputGroupText>
                              </InputGroupAddon>
                              <InputGroupInput {...field} type="email" placeholder="exemplo@empresa.com" className="h-11" />
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
                  className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Nova Senha
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
