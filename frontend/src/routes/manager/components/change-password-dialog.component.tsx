import { Button } from "@lib/components/sh-button/button.component";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@lib/components/sh-dialog/dialog.component";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@lib/components/sh-form/form.component";
import { Field, FieldContent } from "@lib/components/sh-field/field.component";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@lib/components/sh-input-group/input-group.component";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage, toastValidationFieldErrors } from "@lib/utils/api-error/api-error.util";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { changePasswordSchema, type ChangePasswordFormData, type ChangePasswordRequestDto } from "@lib/data/auth/molecule/auth.schema";
import { changePasswordAttempt } from "@lib/data/auth/services/auth.service";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
    setOpen(newOpen);
  };

  const mutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) => {
      const payload: ChangePasswordRequestDto = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      };

      return changePasswordAttempt(payload);
    },
    onSuccess: () => {
      toast.success("Sua senha foi alterada com sucesso!");
      handleOpenChange(false);
    },
    onError: (error) => {
      if (toastValidationFieldErrors(error, {
        oldPassword: "Senha atual",
        newPassword: "Nova senha",
      })) {
        return;
      }

      toast.error(getErrorMessage(error, "Erro ao alterar a senha. Verifique sua senha atual e tente novamente."));
    },
  });

  const onSubmit = async (values: ChangePasswordFormData) => {
    await mutation.mutateAsync(values);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="warning" className="h-11 px-5 font-bold uppercase text-xs tracking-widest shadow-sm">
          Alterar Senha
          <KeyRound className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>

      <DialogContent showCloseButton className="rounded-[2.5rem] border-white/20 bg-card backdrop-blur-3xl shadow-neumorph">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-warning/10 border border-warning/20">
            <KeyRound className="w-8 h-8 text-warning" />
          </div>

          <DialogTitle className="text-center">Alterar Senha</DialogTitle>

          <DialogDescription className="text-center pt-2">
            Atualize sua senha de acesso ao sistema. Lembre-se de usar uma senha forte e segura.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <Field>
                    <FormLabel>Senha Atual</FormLabel>
                    <FieldContent>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput {...field} type={showOldPassword ? "text" : "password"} placeholder="••••••••" />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              onClick={() => setShowOldPassword((value) => !value)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <Field>
                    <FormLabel>Nova Senha</FormLabel>
                    <FieldContent>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput {...field} type={showNewPassword ? "text" : "password"} placeholder="••••••••" />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              onClick={() => setShowNewPassword((value) => !value)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="warning" disabled={!form.formState.isValid || mutation.isPending}>
                {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Confirmar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
