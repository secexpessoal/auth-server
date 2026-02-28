import { Button } from "@components/sh-button/button.component";
import { Calendar } from "@components/sh-calendar/calendar.component";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@components/sh-dialog/dialog.component";
import { Input } from "@components/sh-input/input.component";
import { Label } from "@components/sh-label/label.component";
import { Popover, PopoverContent, PopoverTrigger } from "@components/sh-popover/popover.component";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/sh-select/select.component";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/sh-table/table.component";
import { Checkbox } from "@components/sh-checkbox/checkbox.component";
import { getErrorMessage } from "@lib/api-error/api-error.util";
import { cn } from "@lib/cn.util";
import { queryClient } from "@lib/query.util";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, Copy, Eye, Info, KeyRound, Loader2, RefreshCw, Save, ShieldAlert, UserCheck, UserX, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { UserResponseDto } from "../../auth/molecule/auth.types";
import { activateUserAttempt, deactivateUserAttempt, getUsersList, resetPasswordAttempt, updateUserProfile } from "../services/user.service";
import { type UpdateUserProfileRequestDto, updateUserProfileSchema } from "./user.schema";

export function UsersTableComponent() {
  const [page, setPage] = useState(0);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    data: paginatedUsers,
    isRefetching,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsersList(page, 50),
  });

  const resetMutation = useMutation({
    mutationFn: (email: string) => resetPasswordAttempt(email),
    onSuccess: (data) => {
      setTemporaryPassword(data.temp_password);
      setResetDialogOpen(true);
      toast.success("Senha resetada com sucesso!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erro ao resetar senha do usuário."));
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => deactivateUserAttempt(userId),
    onSuccess: () => {
      toast.success("Usuário desativado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erro ao desativar usuário."));
    },
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => activateUserAttempt(userId),
    onSuccess: () => {
      toast.success("Usuário ativado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erro ao ativar usuário."));
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserProfileRequestDto }) => updateUserProfile(userId, payload),
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDetailsModalOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erro ao atualizar perfil."));
    },
  });

  const handleOpenDetails = (user: UserResponseDto) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  const copyToClipboard = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      toast.success("Senha copiada para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>

        <p className="text-red-600 font-semibold mb-2">Erro ao carregar usuários</p>

        <p className="text-gray-500 text-sm mb-6 max-w-sm text-center">
          {getErrorMessage(error, "Não foi possível buscar a lista de usuários no momento.")}
        </p>

        <Button onClick={() => refetch()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const users = paginatedUsers?.data || [];
  const pagination = paginatedUsers?.meta.pagination;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Usuários Cadastrados</h2>
        <div className="flex items-center gap-3">
          {isRefetching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          <Button variant="ghost" size="icon" onClick={() => refetch()} className="h-8 w-8 text-gray-400">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{pagination?.totalItems || 0} usuários</span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-medium text-gray-900">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{user.profile.username}</span>
                      {!user.active && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-tighter">
                          Inativo
                        </span>
                      )}
                      {user.audit.updated_by === "system" && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-tighter">
                          Exige Reset
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-normal">ID: {user.id.slice(0, 8)}...</span>
                  </div>
                </TableCell>

                <TableCell className="text-gray-500">{user.email}</TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${role === "ROLE_ADMIN" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-gray-50 text-gray-600 border border-gray-100"}`}
                      >
                        {role.replace("ROLE_", "")}
                      </span>
                    ))}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 transition-all">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full"
                      onClick={() => resetMutation.mutate(user.email)}
                      title="Resetar Senha"
                      disabled={resetMutation.isPending}
                    >
                      <KeyRound className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 rounded-full ${user.active ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"}`}
                      onClick={() => (user.active ? deactivateMutation.mutate(user.id) : activateMutation.mutate(user.id))}
                      title={user.active ? "Desativar" : "Ativar"}
                      disabled={deactivateMutation.isPending || activateMutation.isPending}
                    >
                      {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-full border border-gray-100 hover:border-primary-100"
                      onClick={() => handleOpenDetails(user)}
                      title="Ver Detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {pagination.page + 1} de {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.hasPrevious} onClick={() => setPage((prev) => Math.max(0, prev - 1))}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage((prev) => prev + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Details & Actions Modal */}
      <UserDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        user={selectedUser}
        onUpdate={(payload) => selectedUser && updateProfileMutation.mutate({ userId: selectedUser.id, payload })}
        onReset={() => selectedUser && resetMutation.mutate(selectedUser.email)}
        onToggleStatus={() => {
          if (!selectedUser) return;
          if (selectedUser.active) {
            deactivateMutation.mutate(selectedUser.id);
          } else {
            activateMutation.mutate(selectedUser.id);
          }
          setDetailsModalOpen(false);
        }}
        isPending={updateProfileMutation.isPending || resetMutation.isPending || deactivateMutation.isPending || activateMutation.isPending}
      />

      {/* Reset Password Result Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Info className="w-6 h-6 text-primary-600" />
            </div>
            <DialogTitle className="text-center">Senha Resetada com Sucesso</DialogTitle>
            <DialogDescription className="text-center pt-2">
              A nova senha temporária de <span className="font-bold text-gray-900">{selectedUser?.profile.username}</span> está abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 px-1">
            <button
              onClick={copyToClipboard}
              className="w-full bg-gray-50/50 border-2 border-dashed border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 rounded-2xl p-8 flex items-center justify-center flex-col gap-3 transition-all group relative active:scale-[0.98]"
            >
              <div className="absolute top-3 right-3 p-2 rounded-lg bg-white shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Senha Temporária</span>
              <code className="text-3xl font-mono font-bold text-gray-900 tracking-[0.2em] bg-white px-6 py-3 rounded-xl border border-gray-100 shadow-sm transition-all">
                {temporaryPassword}
              </code>
              <span className="text-xs text-primary-600 font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="w-3 h-3" /> Clique para copiar
              </span>
            </button>
          </div>
          <div className="mt-8 flex justify-center">
            <Button onClick={() => setResetDialogOpen(false)} className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary-200">
              Ok, copiado!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserDetailsModal({
  open,
  onOpenChange,
  user,
  onUpdate,
  onReset,
  onToggleStatus,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  onUpdate: (payload: UpdateUserProfileRequestDto) => void;
  onReset: () => void;
  onToggleStatus: () => void;
  isPending: boolean;
}) {
  const form = useForm({
    defaultValues: {
      username: "",
      position: null,
      work_regime: undefined,
      registration: "",
      lives_elsewhere: false,
      birth_date: null,
      in_person_work_period: null,
    } as UpdateUserProfileRequestDto,
    validators: {
      onChange: updateUserProfileSchema,
    },
    onSubmit: async ({ value }) => {
      // Sanitize data: convert empty strings to null and handle nested period
      const sanitized: UpdateUserProfileRequestDto = {
        ...value,
        birth_date: value.birth_date || null,
        position: value.position?.trim() || null,
        work_regime: value.work_regime || undefined,
        username: value.username?.trim() || undefined,
        registration: value.registration?.trim() || null,
        in_person_work_period: value.in_person_work_period?.start || value.in_person_work_period?.end ? value.in_person_work_period : null,
      };
      onUpdate(sanitized);
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        position: user.profile.position,
        work_regime: user.profile.work_regime,
        username: user.profile.username || "",
        birth_date: user.profile.birth_date || null,
        registration: user.profile.registration || "",
        lives_elsewhere: user.profile.lives_elsewhere || false,
        in_person_work_period: {
          start: user.profile.in_person_work_period?.start || null,
          end: user.profile.in_person_work_period?.end || null,
        },
      });
    }
  }, [user, open, form]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-5xl max-h-[95vh] overflow-y-auto p-0 bg-gray-50/50 border-none shadow-2xl" showCloseButton>
        <div className="flex flex-col h-full bg-white rounded-t-lg">
          {/* Header Section - Modern Gradient */}
          <div className="p-8 pb-14 bg-linear-to-br from-primary-700 to-indigo-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-12 -translate-y-12">
              <Eye className="w-64 h-64" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-md mb-6 border border-white/20">
                <Eye className="w-6 h-6 text-white" />
              </div>

              <DialogTitle className="text-4xl font-extrabold tracking-tight mb-2">Detalhes do Usuário</DialogTitle>
              <DialogDescription className="text-primary-100 text-lg max-w-2xl font-medium">
                Gerencie perfil, regime de trabalho e governação de <span className="text-white border-b border-primary-400">{user.email}</span>.
              </DialogDescription>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
            className="px-8 -mt-6 relative z-20 space-y-5 pb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              <div className="md:col-span-7 space-y-5">
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl shadow-gray-200/40">
                  <div className="flex items-center gap-3 mb-6 border-l-4 border-primary-500 pl-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Informações do Perfil</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-[10px] font-bold text-gray-500 ml-1">Nome de Usuário</Label>

                      <form.Field
                        name="username"
                        children={(field) => (
                          <Input
                            id={field.name}
                            value={field.state.value || ""}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            className="h-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base font-medium"
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-1">
                      <Label className="text-[10px] font-bold text-gray-500 ml-1">Matrícula</Label>
                      <form.Field
                        name="registration"
                        children={(field) => (
                          <>
                            <Input
                              id={field.name}
                              maxLength={6}
                              value={field.state.value || ""}
                              onChange={(event) => field.handleChange(event.target.value)}
                              onBlur={field.handleBlur}
                              className="h-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base font-medium"
                            />
                            {field.state.meta.errors.length > 0 && (
                              <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" />
                                {field.state.meta.errors[0]?.message || field.state.meta.errors[0]?.toString()}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-3">
                      <Label className="text-[10px] font-bold text-gray-500 ml-1">Cargo / Posição Profissional</Label>
                      <form.Field
                        name="position"
                        children={(field) => (
                          <Input
                            id={field.name}
                            value={field.state.value || ""}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            className="h-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base font-medium"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl shadow-gray-200/40">
                  <div className="flex items-center gap-3 mb-5 border-l-4 border-indigo-500 pl-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Regime & Localização</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-gray-500 ml-1">Data de Nascimento</Label>
                      <form.Field
                        name="birth_date"
                        children={(field) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full h-10 justify-start text-left font-medium rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white transition-all px-3 text-sm",
                                  !field.state.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                                {field.state.value && typeof field.state.value === "string" ? (
                                  format(parseISO(field.state.value), "PPP", {
                                    locale: ptBR,
                                  })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0 rounded-2xl border-gray-100 shadow-2xl" align="start">
                              <Calendar
                                autoFocus
                                mode="single"
                                locale={ptBR}
                                className="rounded-2xl"
                                captionLayout="dropdown"
                                startMonth={new Date(1900, 0)}
                                endMonth={new Date(new Date().getFullYear(), 11)}
                                disabled={(date) => date < new Date("1900-01-01")}
                                onSelect={(date) => field.handleChange(date?.toISOString())}
                                selected={field.state.value && typeof field.state.value === "string" ? parseISO(field.state.value) : undefined}
                                defaultMonth={field.state.value && typeof field.state.value === "string" ? parseISO(field.state.value) : undefined}
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-gray-500 ml-1">Regime de Trabalho</Label>
                      <form.Field
                        name="work_regime"
                        children={(field) => (
                          <Select onValueChange={(val: "HOME_WORK" | "OFFICE" | "HYBRID") => field.handleChange(val)} value={field.state.value}>
                            <SelectTrigger className="w-full h-10 rounded-xl bg-gray-50/50 border border-gray-100 px-3 text-sm focus:ring-primary-500/20 transition-all font-medium">
                              <SelectValue placeholder="Selecione o regime" />
                            </SelectTrigger>

                            <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                              <SelectItem value="HOME_WORK" className="rounded-xl">
                                Remoto (Home Office)
                              </SelectItem>

                              <SelectItem value="OFFICE" className="rounded-xl">
                                Presencial (Escritório)
                              </SelectItem>

                              <SelectItem value="HYBRID" className="rounded-xl">
                                Híbrido
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 sm:col-span-2">
                      <form.Field
                        name="lives_elsewhere"
                        children={(field) => (
                          <>
                            <Checkbox
                              id="lives_elsewhere"
                              checked={field.state.value || false}
                              onCheckedChange={(checked) => field.handleChange(checked === true)}
                              className="w-5 h-5 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-500"
                            />

                            <Label htmlFor="lives_elsewhere" className="text-sm font-bold text-gray-700 cursor-pointer">
                              Reside fora da cidade?
                            </Label>
                          </>
                        )}
                      />
                    </div>
                    <form.Subscribe
                      selector={(state) => state.values.work_regime}
                      children={(workRegime) =>
                        workRegime === "HYBRID" ? (
                          <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                            <Label className="text-[10px] font-bold text-gray-500 ml-1 mb-2 block">Período de Trabalho (Dias Presenciais)</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <form.Field
                                name="in_person_work_period.start"
                                children={(field) => (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-gray-400 ml-1">A partir de</span>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className={cn(
                                            "w-full h-10 justify-start text-left font-medium rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white transition-all px-3 text-sm",
                                            !field.state.value && "text-muted-foreground",
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                                          {field.state.value && typeof field.state.value === "string" ? (
                                            format(parseISO(field.state.value), "PPP", { locale: ptBR })
                                          ) : (
                                            <span>Selecione</span>
                                          )}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 rounded-2xl border-gray-100 shadow-2xl" align="start">
                                        <Calendar
                                          mode="single"
                                          locale={ptBR}
                                          className="rounded-2xl"
                                          captionLayout="dropdown"
                                          startMonth={new Date(1900, 0)}
                                          endMonth={new Date(new Date().getFullYear() + 10, 11)}
                                          disabled={(date) => date < new Date("1900-01-01")}
                                          onSelect={(date) => field.handleChange(date?.toISOString())}
                                          selected={
                                            field.state.value && typeof field.state.value === "string" ? parseISO(field.state.value) : undefined
                                          }
                                          defaultMonth={
                                            field.state.value && typeof field.state.value === "string" ? parseISO(field.state.value) : undefined
                                          }
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                )}
                              />
                              <form.Field
                                name="in_person_work_period.end"
                                children={(field) => (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-gray-400 ml-1">Até</span>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className={cn(
                                            "w-full h-10 justify-start text-left font-medium rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white transition-all px-3 text-sm",
                                            !field.state.value && "text-muted-foreground",
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                                          {field.state.value && typeof field.state.value === "string" ? (
                                            format(parseISO(field.state.value), "PPP", { locale: ptBR })
                                          ) : (
                                            <span>Selecione</span>
                                          )}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 rounded-2xl border-gray-100 shadow-2xl" align="start">
                                        <Calendar
                                          mode="single"
                                          locale={ptBR}
                                          className="rounded-2xl"
                                          captionLayout="dropdown"
                                          startMonth={new Date(1900, 0)}
                                          endMonth={new Date(new Date().getFullYear() + 10, 11)}
                                          disabled={(date) => date < new Date("1900-01-01")}
                                          onSelect={(date) => field.handleChange(date?.toISOString())}
                                          selected={
                                            field.state.value && typeof field.state.value === "string" ? parseISO(field.state.value) : undefined
                                          }
                                          defaultMonth={
                                            field.state.value && typeof field.state.value === "string" ? parseISO(field.state.value) : undefined
                                          }
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                )}
                              />
                            </div>
                          </div>
                        ) : null
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Governance & Actions */}
              <div className="md:col-span-5 space-y-5">
                {/* Status & Governance Card */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col h-full ring-1 ring-gray-100">
                  <div className="space-y-6 grow">
                    <div className="p-5 rounded-3xl bg-gray-50/70 border border-gray-100 text-center shadow-inner">
                      <span className="block text-[10px] font-black text-gray-400 uppercase mb-4 tracking-tighter">Status Operacional</span>

                      <div className="flex items-center justify-center gap-3">
                        {user.active ? (
                          <span className="px-5 py-2 rounded-full text-base font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-2 shadow-sm">
                            <Check className="w-4 h-4" /> Ativo
                          </span>
                        ) : (
                          <span className="px-5 py-2 rounded-full text-base font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-2 shadow-sm">
                            <X className="w-4 h-4" /> Inativo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Governança</h4>
                      <div className="space-y-3">
                        <div className="flex flex-col p-4 rounded-xl bg-gray-50/50 border border-gray-100 group transition-all">
                          <span className="text-[10px] font-bold text-gray-400 mb-1 group-hover:text-primary-400">Data de Ingresso:</span>
                          <span className="text-sm font-bold text-gray-700">
                            {user.audit.created_at ? format(new Date(user.audit.created_at), "dd/MM/yyyy HH:mm") : "-"}
                          </span>
                        </div>

                        {user.audit.updated_at && (
                          <div className="flex flex-col p-4 rounded-xl bg-gray-50/50 border border-gray-100 group transition-all">
                            <span className="text-[10px] font-bold text-gray-400 mb-1 group-hover:text-amber-500">Última Modificação:</span>
                            <span className="text-sm font-bold text-amber-700">{format(new Date(user.audit.updated_at), "dd/MM/yyyy HH:mm")}</span>
                          </div>
                        )}

                        <div className="flex flex-col p-4 rounded-xl bg-gray-50/50 border border-gray-100 group transition-all">
                          <span className="text-[10px] font-bold text-gray-400 mb-1 group-hover:text-primary-400">Responsável Modificação:</span>
                          <span className="text-sm font-bold text-primary-600 uppercase tracking-tighter truncate">
                            {user.audit.updated_by || "system"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-2xl justify-start font-bold border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-all px-5 shadow-sm"
                        onClick={onReset}
                        disabled={isPending}
                      >
                        <KeyRound className="w-4 h-4 mr-3" /> Resetar Senha Alpha
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full h-12 rounded-2xl justify-start font-bold transition-all px-5 shadow-sm ${user.active ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"}`}
                        onClick={onToggleStatus}
                        disabled={isPending}
                      >
                        {user.active ? (
                          <>
                            <UserX className="w-4 h-4 mr-3" /> Bloquear Acesso
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-3" /> Liberar Acesso
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="bg-gray-50/80 -mx-8 px-8 py-6 rounded-b-3xl border-t border-gray-200 gap-4 mt-6 backdrop-blur-sm">
              <Button
                type="button"
                variant="ghost"
                className="h-14 rounded-xl px-8 font-bold text-gray-500 hover:bg-white hover:shadow-sm"
                onClick={() => onOpenChange(false)}
              >
                Descartar
              </Button>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="h-14 rounded-xl px-12 font-black text-lg shadow-2xl shadow-primary-200/60 bg-primary-600 hover:bg-primary-700 transition-all transform hover:-translate-y-1 active:translate-y-0"
                    disabled={!canSubmit || isSubmitting || isPending}
                  >
                    {isSubmitting || isPending ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                    Persistir Alterações
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
