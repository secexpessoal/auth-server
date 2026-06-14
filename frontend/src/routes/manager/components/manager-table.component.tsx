import { Button } from "@lib/components/sh-button/button.component";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@lib/components/sh-dialog/dialog.component";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@lib/components/sh-input-group/input-group.component";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@lib/components/sh-pagination/pagination.component";
import { Spinner } from "@lib/components/sh-spinner/spinner.component";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@lib/components/sh-table/table.component";
import { toastApiError } from "@lib/utils/api-error/api-error.util";
import { useDebounce } from "@lib/hooks/use-debounce.hook";
import { queryClient } from "@lib/infra/query/query.util";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Separator } from "@lib/components/sh-separator/separator.component";
import { Check, Copy, KeyRound, RefreshCw, Search, ShieldAlert, UserCheck, UserX, Mail, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@lib/utils/cn/cn.util";
import toast from "react-hot-toast";
import type { UserResponseDto } from "@lib/data/auth/molecule/auth.types";
import { resetPasswordAttempt as userResetPasswordAttempt } from "@lib/data/auth/services/auth.service";
import { type UpdateUserProfileRequestDto } from "@lib/data/manager/molecule/user.schema";
import { getGlobalPositionHistory } from "@lib/data/manager/services/user-position.service";
import {
  activateUserAttempt,
  deactivateUserAttempt,
  getUsersList,
  resetPasswordAttempt,
  updateUserProfile,
} from "@lib/data/manager/services/user.service";
import { ManagerDetailsModal } from "./manager-detail.component";

export function ManagerTableComponent() {
  const [page, setPage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const {
    data: paginatedUsers,
    isRefetching,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", page, debouncedSearchTerm],
    queryFn: () => getUsersList(page, 50, debouncedSearchTerm, debouncedSearchTerm, debouncedSearchTerm),
    placeholderData: (previousData) => previousData,
  });

  const { data: globalPositionHistory, dataUpdatedAt: globalPositionHistoryUpdatedAt } = useQuery({
    queryKey: ["global-position-history"],
    queryFn: getGlobalPositionHistory,
  });

  const activeTemporaryPositions = useMemo(() => {
    const latestByUser = new Map<string, NonNullable<typeof globalPositionHistory>[number]>();
    const now = globalPositionHistoryUpdatedAt;

    for (const entry of globalPositionHistory || []) {
      const current = latestByUser.get(entry.userId);
      if (!current || new Date(entry.occurredAt).getTime() > new Date(current.occurredAt).getTime()) {
        latestByUser.set(entry.userId, entry);
      }
    }

    const active = new Map<string, NonNullable<typeof globalPositionHistory>[number]>();
    latestByUser.forEach((entry) => {
      const endDate = entry.plannedEndDate ? new Date(entry.plannedEndDate).getTime() : null;
      if (entry.eventType === "TEMPORARY_START" && (!endDate || endDate >= now)) {
        active.set(entry.userId, entry);
      }
    });

    return active;
  }, [globalPositionHistory, globalPositionHistoryUpdatedAt]);

  const resetMutation = useMutation({
    mutationFn: (email: string) => resetPasswordAttempt(email),
    onSuccess: (data) => {
      setTemporaryPassword(data.tempPassword);
      setResetDialogOpen(true);
      toast.success("Senha resetada com sucesso!");
    },
    onError: (error) => {
      toastApiError(error, "Erro ao resetar senha do usuário.");
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (email: string) => userResetPasswordAttempt(email),
    onSuccess: () => {
      toast.success("E-mail de recuperação enviado com sucesso!");
      setSendEmailDialogOpen(false);
    },
    onError: (error) => {
      toastApiError(error, "Erro ao enviar e-mail de recuperação.");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => deactivateUserAttempt(userId),
    onSuccess: () => {
      toast.success("Usuário desativado com sucesso!");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toastApiError(error, "Erro ao desativar usuário.");
    },
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => activateUserAttempt(userId),
    onSuccess: () => {
      toast.success("Usuário ativado com sucesso!");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toastApiError(error, "Erro ao ativar usuário.");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserProfileRequestDto }) => updateUserProfile(userId, payload),
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      setDetailsModalOpen(false);
    },
    onError: (error) => {
      toastApiError(error, "Erro ao atualizar perfil.");
    },
  });

  const handleOpenDetails = (user: UserResponseDto) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  const copyToClipboard = () => {
    if (temporaryPassword) {
      void navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      toast.success("Senha copiada!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading && !paginatedUsers) {
    return (
      <div className="bg-card rounded-[2.5rem] p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="w-10 h-10 text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-[2.5rem] p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive font-semibold mb-2">Erro ao carregar usuários</p>
        <Button onClick={() => void refetch()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const users = paginatedUsers?.data || [];
  const pagination = paginatedUsers?.meta.pagination;
  const renderPositionCell = (user: UserResponseDto) => {
    const temporaryPosition = activeTemporaryPositions.get(user.id);

    if (temporaryPosition) {
      return (
        <div className="flex max-w-45 flex-col gap-1">
          <span className="truncate rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-sm font-black text-amber-600 dark:text-amber-400">
            {temporaryPosition.toPositionName}
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-600/80 dark:text-amber-400/80">
            Temporário
          </span>
        </div>
      );
    }

    return (
      <span className="text-muted-foreground text-sm font-bold truncate block max-w-[150px]">
        {user.profile?.position?.name || "—"}
      </span>
    );
  };

  return (
    <div>
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-6 flex-1">
          <h2 className="font-bold text-foreground whitespace-nowrap hidden lg:block tracking-tight text-lg">Usuários Cadastrados</h2>
          <InputGroup className="w-full max-w-md">
            <InputGroupAddon>
              <InputGroupText>
                <Search className="w-4 h-4 opacity-50" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar por nome, e-mail ou cargo..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="bg-transparent"
            />
          </InputGroup>
        </div>
        <div className="flex items-center gap-4 justify-end">
          {isRefetching && <Spinner className="w-4 h-4 text-primary" />}
          <Button variant="ghost" size="icon-sm" onClick={() => void refetch()} className="text-muted-foreground hover:text-primary">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
            {pagination?.totalItems || 0} usuários
          </span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10 bg-transparent">
            <TableHead className="font-bold text-foreground/50 uppercase text-[11px] tracking-widest pl-6 h-14">Nome</TableHead>
            <TableHead className="font-bold text-foreground/50 uppercase text-[11px] tracking-widest h-14">Email</TableHead>
            <TableHead className="font-bold text-foreground/50 uppercase text-[11px] tracking-widest h-14">Acesso</TableHead>
            <TableHead className="font-bold text-foreground/50 uppercase text-[11px] tracking-widest h-14">Cargo</TableHead>
            <TableHead className="font-bold text-foreground/50 uppercase text-[11px] tracking-widest text-right pr-6 h-14">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center text-muted-foreground font-medium">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="group hover:bg-white/40 dark:hover:bg-white/5 transition-all border-b border-white/5 last:border-none">
                <TableCell className="pl-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{user.profile?.username || "Usuário"}</span>
                      {!user.active && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-tighter">
                          Inativo
                        </span>
                      )}
                      {user.audit.updatedBy === "system" && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-tighter">
                          Reset
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 font-mono tracking-tighter italic">#{user.id.slice(0, 8)}</span>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground font-medium">{user.email}</TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border transition-colors",
                          role === "ROLE_ADMIN"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border/40"
                        )}
                      >
                        {role.replace("ROLE_", "")}
                      </span>
                    ))}
                  </div>
                </TableCell>

                <TableCell>
                  {renderPositionCell(user)}
                </TableCell>

                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-md"
                      onClick={() => {
                        setSelectedUser(user);
                        setSendEmailDialogOpen(true);
                      }}
                      disabled={sendEmailMutation.isPending}
                      title="Enviar e-mail de recuperação"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 rounded-md"
                      onClick={() => {
                        setSelectedUser(user);
                        resetMutation.mutate(user.email);
                      }}
                      disabled={resetMutation.isPending}
                      title="Resetar Senha"
                    >
                      <KeyRound className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={cn(
                        "rounded-md",
                        user.active ? "text-destructive hover:bg-destructive/10" : "text-emerald-500 hover:bg-emerald-500/10"
                      )}
                      onClick={() => (user.active ? deactivateMutation.mutate(user.id) : activateMutation.mutate(user.id))}
                      disabled={deactivateMutation.isPending || activateMutation.isPending}
                      title={user.active ? "Desativar" : "Ativar"}
                    >
                      {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-md font-black text-[10px] uppercase tracking-widest border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                      onClick={() => handleOpenDetails(user)}
                      title="Ver Detalhes"
                    >
                      Detalhes
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
        <div className="p-6 border-t border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5">
          <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
            Página {pagination.page + 1} de {pagination.totalPages}
          </p>
          <Pagination className="w-auto mx-0">
            <PaginationContent className="gap-2">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  className={cn(
                    "rounded-md font-bold bg-card shadow-neumorph-sm hover:translate-y-[-1px] transition-all",
                    !pagination.hasPrevious && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((prev) => prev + 1)}
                  className={cn(
                    "rounded-md font-bold bg-card shadow-neumorph-sm hover:translate-y-[-1px] transition-all",
                    !pagination.hasNext && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Details & Actions Modal */}
      <ManagerDetailsModal
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
        onUpdateRoles={() => {
          void queryClient.invalidateQueries({ queryKey: ["users"] });
        }}
        isPending={updateProfileMutation.isPending || resetMutation.isPending || deactivateMutation.isPending || activateMutation.isPending}
      />

      {/* Send Reset Email Dialog */}
      <Dialog open={sendEmailDialogOpen} onOpenChange={setSendEmailDialogOpen}>
        <DialogContent size="sm" showCloseButton className="rounded-[2.5rem] border-white/20 bg-card shadow-neumorph backdrop-blur-3xl">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
            <DialogTitle className="text-center">Enviar E-mail</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Deseja enviar as instruções de recuperação de senha para <span className="font-bold text-primary">{selectedUser?.email}</span>?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-6 sm:justify-center">
            <Button onClick={() => setSendEmailDialogOpen(false)} variant="outline" size="h12" className="font-black px-8">
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedUser && sendEmailMutation.mutate(selectedUser.email)} 
              size="h12" 
              className="font-black px-8 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={sendEmailMutation.isPending}
            >
              {sendEmailMutation.isPending ? <Spinner className="w-5 h-5 mr-2 text-white" /> : <Send className="w-5 h-5 mr-2" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Result Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent showCloseButton className="rounded-[2.5rem] border-white/20 bg-card shadow-neumorph backdrop-blur-3xl">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center">Senha Resetada</DialogTitle>
            <DialogDescription className="text-center pt-2">
              A nova senha temporária de <span className="font-bold text-primary">{selectedUser?.profile?.username || "Usuário"}</span> está disponível.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-8 px-1">
            <button
              onClick={copyToClipboard}
              className="w-full bg-black/5 dark:bg-white/5 border-2 border-dashed border-primary/20 hover:border-primary/40 rounded-xl p-6 sm:p-10 flex items-center justify-center flex-col gap-4 transition-all group relative active:scale-[0.98]"
            >
              <div className="absolute top-4 right-4 p-2 rounded-md bg-card shadow-neumorph-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-primary/60" />}
              </div>
              <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Senha Temporária</span>
              <code className="text-xl sm:text-2xl md:text-3xl font-mono font-black text-foreground tracking-tight sm:tracking-[0.1em] bg-white/50 dark:bg-white/5 px-4 sm:px-8 py-4 rounded-md border border-white/10 shadow-neumorph-sm transition-all group-hover:shadow-neumorph break-all max-w-full text-center">
                {temporaryPassword}
              </code>
              <span className="text-xs text-primary font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="w-3 h-3" /> Clique para copiar senha
              </span>
            </button>
          </div>
          
          <DialogFooter className="mt-10">
            <Button onClick={() => setResetDialogOpen(false)} size="h12" className="w-full font-black text-lg">
              Concluído
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
