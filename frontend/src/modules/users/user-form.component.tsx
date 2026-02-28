import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus, ShieldPlus, CheckCircle2, Copy } from "lucide-react";
import toast from "react-hot-toast";

import { Input } from "../../components/sh-input/input.component";
import { Button } from "../../components/sh-button/button.component";
import { Label } from "../../components/sh-label/label.component";
import { registerAdminSchema, type RegisterAdminFormData } from "./molecule/user.schema";
import { registerAdminAttempt, registerUserAttempt } from "./services/user.service";
import { getErrorMessage } from "../../lib/api-error/api-error.util";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/sh-dialog/dialog.component";

type Props = {
  role: "ADMIN" | "USER";
};

export function CreateUserDialog({ role }: Props) {
  const [open, setOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const isAdmin = role === "ADMIN";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterAdminFormData>({
    resolver: zodResolver(registerAdminSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setGeneratedPassword(null);
      reset();
    }
    setOpen(newOpen);
  };

  const registerMutation = useMutation({
    mutationFn: isAdmin ? registerAdminAttempt : registerUserAttempt,
    onSuccess: (data) => {
      toast.success(`${isAdmin ? "Administrador" : "Usuário"} cadastrado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["users"] });

      if (data?.temp_password) {
        setGeneratedPassword(data.temp_password);
      } else {
        handleOpenChange(false);
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, `Erro ao cadastrar ${isAdmin ? "administrador" : "usuário"}. Tente novamente.`));
    },
  });

  const onSubmit = async (values: RegisterAdminFormData) => {
    await registerMutation.mutateAsync(values);
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
                  navigator.clipboard.writeText(generatedPassword);
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="ml-1">
                Nome de Usuário
              </Label>

              <Input
                id="username"
                type="text"
                placeholder="ex: admin_master"
                {...register("username")}
                className={errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="ml-1">
                E-mail
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                {...register("email")}
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={registerMutation.isPending} className={isAdmin ? "bg-indigo-600 hover:bg-indigo-700" : ""}>
                {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar {isAdmin ? "Administrador" : "Usuário"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
