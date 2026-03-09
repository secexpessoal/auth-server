import { Button } from "@components/sh-button/button.component";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@components/sh-input-group/input-group.component";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/sh-form/form.component";
import { Field, FieldContent } from "@components/sh-field/field.component";
import { getErrorMessage } from "@lib/api-error/api-error.util";
import { useAuthStore } from "@store/auth.store";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { firstChangeSchema, type FirstChangeFormData } from "./molecule/auth.schema";
import { firstChangePasswordAttempt } from "./services/auth.service";

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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel>Nova Senha</FormLabel>
                        <FieldContent>
                          <FormControl>
                            <InputGroup>
                              <InputGroupInput {...field} type={showPassword ? "text" : "password"} placeholder="••••••••" />
                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  type="button"
                                  onClick={() => setShowPassword((value) => !value)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FieldContent>
                          <FormControl>
                            <InputGroup>
                              <InputGroupInput {...field} type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" />
                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  type="button"
                                  onClick={() => setShowConfirmPassword((v) => !v)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:hover:scale-100"
                  disabled={!form.formState.isValid || form.formState.isSubmitting || mutation.isPending}
                >
                  {form.formState.isSubmitting || mutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 mr-2" />
                  )}

                  {form.formState.isSubmitting || mutation.isPending ? "Atualizando..." : "Atualizar e Sair"}
                </Button>
              </form>
            </Form>
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
