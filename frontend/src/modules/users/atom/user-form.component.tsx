import { Button } from "@components/sh-button/button.component";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/sh-dialog/dialog.component";
import { Input } from "@components/sh-input/input.component";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/sh-form/form.component";
import { Field, FieldContent } from "@components/sh-field/field.component";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/sh-select/select.component";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@lib/api-error/api-error.util";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Copy, Loader2, ShieldPlus, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { registerAdminSchema, registerUserSchema } from "@modules/users/molecule/user.schema";
import { registerAdminAttempt, registerUserAttempt } from "@modules/users/services/user.service";

type Props = {
  role: "ADMIN" | "USER";
};

// NOTE: Sö existe para poder fazer o ADMIN ser opcional no role
type RegisterFormData = {
  username: string;
  email: string;
  role?: "USER" | "MANAGER";
};

export function CreateUserDialog({ role }: Props) {
  const [open, setOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const isAdmin = role === "ADMIN";

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(isAdmin ? registerAdminSchema : registerUserSchema),
    mode: "onChange",
    defaultValues: isAdmin ? { username: "", email: "" } : { username: "", email: "", role: "USER" },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setGeneratedPassword(null);
      form.reset();
    }
    setOpen(newOpen);
  };

  const registerMutation = useMutation({
    mutationFn: isAdmin ? registerAdminAttempt : registerUserAttempt,
    onSuccess: (data) => {
      toast.success(`${isAdmin ? "Administrador" : "Usuário"} cadastrado com sucesso!`);
      void queryClient.invalidateQueries({ queryKey: ["users"] });

      if (data?.tempPassword) {
        setGeneratedPassword(data.tempPassword);
      } else {
        handleOpenChange(false);
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, `Erro ao cadastrar ${isAdmin ? "administrador" : "usuário"}. Tente novamente.`));
    },
  });

  const onSubmit = async (values: RegisterFormData) => {
    const payload = isAdmin
      ? { username: values.username, email: values.email }
      : { username: values.username, email: values.email, role: values.role };

    await registerMutation.mutateAsync(payload);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={isAdmin ? "default" : "outline"} className={isAdmin ? "bg-indigo-600 hover:bg-indigo-700" : ""}>
          {isAdmin ? <ShieldPlus className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          Novo {isAdmin ? "Admin" : "Usuário"}
        </Button>
      </DialogTrigger>

      <DialogContent showCloseButton>
        <DialogHeader>
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isAdmin ? "bg-indigo-100" : "bg-primary-100"}`}>
            {generatedPassword ? (
              <CheckCircle2 className={`w-6 h-6 text-green-600`} />
            ) : isAdmin ? (
              <ShieldPlus className={`w-6 h-6 text-indigo-600`} />
            ) : (
              <UserPlus className={`w-6 h-6 text-primary-600`} />
            )}
          </div>

          <DialogTitle className="text-center">
            {generatedPassword ? "Cadastro Realizado!" : `Cadastrar Novo ${isAdmin ? "Administrador" : "Usuário"}`}
          </DialogTitle>

          <DialogDescription className="text-center pt-2">
            {generatedPassword
              ? "O usuário foi criado com sucesso. Copie a senha temporária abaixo para o primeiro acesso."
              : isAdmin
                ? "Cadastre um novo usuário com privilégios de acesso total ao sistema."
                : "Cadastre um novo usuário para acesso restrito às funcionalidades comuns."}
          </DialogDescription>
        </DialogHeader>

        {generatedPassword ? (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between border border-border">
              <code className="text-lg font-mono font-semibold text-foreground tracking-wider">{generatedPassword}</code>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  void navigator.clipboard.writeText(generatedPassword);
                  toast.success("Senha copiada para a área de transferência!");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button onClick={() => handleOpenChange(false)} className={isAdmin ? "bg-indigo-600 hover:bg-indigo-700" : ""}>
                Concluir
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel>Nome de Usuário</FormLabel>
                      <FieldContent>
                        <FormControl>
                          <Input {...field} type="text" placeholder="ex: admin_master" />
                        </FormControl>
                      </FieldContent>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel>E-mail</FormLabel>
                      <FieldContent>
                        <FormControl>
                          <Input {...field} type="email" placeholder="usuario@exemplo.com" />
                        </FormControl>
                      </FieldContent>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              {!isAdmin && (
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel>Cargo</FormLabel>
                        <FieldContent>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || "USER"}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um cargo..." />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="USER">Usuário</SelectItem>
                                <SelectItem value="MANAGER">Gerenciador</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FieldContent>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
              )}

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className={isAdmin ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                >
                  {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar {isAdmin ? "Administrador" : "Usuário"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
