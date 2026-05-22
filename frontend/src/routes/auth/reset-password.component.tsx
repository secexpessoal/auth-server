import { Button } from "@lib/components/sh-button/button.component";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@lib/components/sh-input-group/input-group.component";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@lib/components/sh-form/form.component";
import { Field, FieldContent } from "@lib/components/sh-field/field.component";
import { getErrorMessage } from "@lib/utils/api-error/api-error.util";
import { useAuthStore } from "@lib/store/auth.store";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { firstChangeSchema, type FirstChangeFormData } from "@lib/data/auth/molecule/auth.schema";
import { firstChangePasswordAttempt } from "@lib/data/auth/services/auth.service";

export function ResetPasswordPage() {
  const { isAuthenticated, passwordResetRequired, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: FirstChangeFormData) => firstChangePasswordAttempt(data.password),
    onSuccess: () => {
      toast.success("Senha atualizada com sucesso! Por favor, faça login com sua nova senha.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erro ao atualizar senha. Tente novamente."));
    },
  });

  const form = useForm<FirstChangeFormData>({
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

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!passwordResetRequired) return <Navigate to="/" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 selection:bg-primary/20">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-[2.5rem] shadow-neumorph border border-white/20 overflow-hidden transform transition-all duration-500 hover:shadow-neumorph-convex">
          <div className="p-8 sm:p-12">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 bg-card shadow-neumorph-convex rounded-3xl flex items-center justify-center mb-6 border border-white/40 animate-pulse-subtle">
                <KeyRound className="w-10 h-10 text-primary" />
              </div>

              <h1 className="text-3xl font-black text-foreground tracking-tight mb-3">Nova Credencial</h1>

              <p className="text-muted-foreground font-medium">
                Olá, <span className="font-bold text-foreground">{user?.profile.username}</span>.
                <br />
                Por segurança, defina sua nova senha corporativa.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel className="font-bold ml-1">Nova Senha</FormLabel>
                        <FieldContent>
                          <FormControl>
                            <InputGroup className="bg-transparent">
                              <InputGroupInput {...field} type={showPassword ? "text" : "password"} placeholder="••••••••" />
                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  type="button"
                                  onClick={() => setShowPassword((value) => !value)}
                                  className="text-muted-foreground hover:text-primary transition-colors p-2"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </InputGroupButton>
                              </InputGroupAddon>
                            </InputGroup>
                          </FormControl>
                        </FieldContent>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel className="font-bold ml-1">Confirmar Senha</FormLabel>
                        <FieldContent>
                          <FormControl>
                            <InputGroup className="bg-transparent">
                              <InputGroupInput {...field} type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" />
                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  type="button"
                                  onClick={() => setShowConfirmPassword((value) => !value)}
                                  className="text-muted-foreground hover:text-primary transition-colors p-2"
                                >
                                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </InputGroupButton>
                              </InputGroupAddon>
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
                  className="w-full text-xl font-bold rounded-md shadow-sm"
                  disabled={!form.formState.isValid || form.formState.isSubmitting || mutation.isPending}
                >
                  {form.formState.isSubmitting || mutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 mr-3" />
                  )}

                  {form.formState.isSubmitting || mutation.isPending ? "Processando..." : "Confirmar e Sair"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="p-8 bg-card/50 border-t border-white/10 text-center">
            <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
              Security Protocol Layer &bull; v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
