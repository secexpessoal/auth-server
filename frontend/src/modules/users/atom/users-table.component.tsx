import { Button } from "@components/sh-button/button.component";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/sh-dialog/dialog.component";
import { Input } from "@components/sh-input/input.component";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@components/sh-pagination/pagination.component";
import { Spinner } from "@components/sh-spinner/spinner.component";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/sh-table/table.component";
import { getErrorMessage } from "@lib/api-error/api-error.util";
import { useDebounce } from "@lib/hooks/use-debounce.hook";
import { queryClient } from "@lib/query/query.util";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Copy, Eye, Info, KeyRound, RefreshCw, Search, ShieldAlert, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import type { UserResponseDto } from "@modules/auth/molecule/auth.types";
import { type UpdateUserProfileRequestDto } from "@modules/users/molecule/user.schema";
import {
  activateUserAttempt,
  deactivateUserAttempt,
  getUsersList,
  resetPasswordAttempt,
  updateUserProfile,
} from "@modules/users/services/user.service";
import { UserDetailsModal } from "./users-detail.component";

export function UsersTableComponent() {
  const [page, setPage] = useState(0);

  const [copied, setCopied] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);

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

  const resetMutation = useMutation({
    mutationFn: (email: string) => resetPasswordAttempt(email),
    onSuccess: (data) => {
      setTemporaryPassword(data.tempPassword);
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
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erro ao desativar usuário."));
    },
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => activateUserAttempt(userId),
    onSuccess: () => {
      toast.success("Usuário ativado com sucesso!");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erro ao ativar usuário."));
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
      toast.error(getErrorMessage(error, "Erro ao atualizar perfil."));
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

      toast.success("Senha copiada para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading && !paginatedUsers) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="w-10 h-10 text-primary-600 mb-4" />
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

        <Button onClick={() => void refetch()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const users = paginatedUsers?.data || [];
  const pagination = paginatedUsers?.meta.pagination;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="font-semibold text-gray-900 whitespace-nowrap hidden lg:block">Usuários Cadastrados</h2>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />

            <Input
              placeholder="Buscar por nome, e-mail ou cargo..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0); // Reset page when searching
              }}
              className="pl-10 h-10 bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 justify-end">
          {isRefetching && <Spinner className="w-4 h-4 text-gray-400" />}
          <Button variant="ghost" size="icon" onClick={() => void refetch()} className="h-8 w-8 text-gray-400">
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
            <TableHead>Nível de Acesso</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-gray-500">
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
                      {user.audit.updatedBy === "system" && (
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

                <TableCell>
                  <div className="max-w-[200px]">
                    <span className="text-gray-600 text-sm font-medium truncate block" title={user.profile.position || ""}>
                      {user.profile.position || "-"}
                    </span>
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
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  className={!pagination.hasPrevious ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  size="default"
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((prev) => prev + 1)}
                  className={!pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  size="default"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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
        onUpdateRoles={() => {
          void queryClient.invalidateQueries({ queryKey: ["users"] });
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
