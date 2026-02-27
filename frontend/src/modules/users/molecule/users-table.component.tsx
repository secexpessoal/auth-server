import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../components/ui/table.component'
import { Button } from '../../../components/ui/button.component'
import { KeyRound, ShieldAlert, Loader2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog.component'
import { getUsersList, resetPasswordAttempt } from '../services/user.service'
import type { MetadataUserResponseDto } from '../../auth/molecule/auth.types'
import { getErrorMessage } from '../../../lib/api-error.util'
import toast from 'react-hot-toast'

export function UsersTableComponent() {
    const [page, setPage] = useState(0)
    const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
    const [resetDialogOpen, setResetDialogOpen] = useState(false)

    const { data: paginatedUsers, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['users', page],
        queryFn: () => getUsersList(page, 50),
    })

    const resetMutation = useMutation({
        mutationFn: (email: string) => resetPasswordAttempt(email),
        onSuccess: (data) => {
            setTemporaryPassword(data.temp_password)
            setResetDialogOpen(true)
            toast.success('Senha resetada com sucesso!')
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Erro ao resetar senha do usuário.'))
        }
    })

    const handleResetPassword = (user: MetadataUserResponseDto) => {
        resetMutation.mutate(user.email)
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Carregando usuários...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-semibold mb-2">Erro ao carregar usuários</p>
                <p className="text-gray-500 text-sm mb-6 max-w-sm text-center">
                    {getErrorMessage(error, 'Não foi possível buscar a lista de usuários no momento.')}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                    Tentar Novamente
                </Button>
            </div>
        )
    }

    const users = paginatedUsers?.data || []
    const pagination = paginatedUsers?.meta.pagination

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Usuários Cadastrados</h2>
                <div className="flex items-center gap-3">
                    {isRefetching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                    <Button variant="ghost" size="icon" onClick={() => refetch()} className="h-8 w-8 text-gray-400">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                        {pagination?.totalItems || 0} usuários
                    </span>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                Nenhum usuário encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium text-gray-900">{user.username}</TableCell>
                                <TableCell className="text-gray-500">{user.email}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {user.active ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                            Ativo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Inativo
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-gray-500">
                                    {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                                        onClick={() => handleResetPassword(user)}
                                        disabled={resetMutation.isPending}
                                        title="Resetar Senha"
                                    >
                                        {resetMutation.isPending && resetMutation.variables === user.email ? (
                                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                        ) : (
                                            <KeyRound className="w-4 h-4 mr-1.5" />
                                        )}
                                        Resetar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Página {pagination.page + 1} de {pagination.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.hasPrevious}
                            onClick={() => setPage(prev => Math.max(0, prev - 1))}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.hasNext}
                            onClick={() => setPage(prev => prev + 1)}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            )}

            {/* Temporary Password Reset Dialog */}
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogContent showCloseButton>
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                            <ShieldAlert className="w-6 h-6 text-amber-600" />
                        </div>
                        <DialogTitle className="text-center">Senha Resetada com Sucesso</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            A senha do usuário foi resetada. Copie a senha temporária abaixo e envie para o usuário.
                            Ele será forçado a trocá-la no próximo acesso.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-4 flex items-center justify-center flex-col gap-2">
                        <span className="text-sm font-medium text-gray-500">Senha Temporária</span>
                        <code className="text-2xl font-mono font-bold text-gray-900 tracking-wider bg-white px-4 py-2 rounded border border-gray-200 shadow-sm">
                            {temporaryPassword}
                        </code>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Button onClick={() => setResetDialogOpen(false)} className="w-full sm:w-auto min-w-[120px]">
                            Ok, copiado!
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
