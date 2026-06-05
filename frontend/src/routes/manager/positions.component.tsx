import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, Plus, Search, RefreshCw, Pencil, Power, Briefcase } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@lib/components/sh-button/button.component";
import { Input } from "@lib/components/sh-input/input.component";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@lib/components/sh-table/table.component";
import { Spinner } from "@lib/components/sh-spinner/spinner.component";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@lib/components/sh-dialog/dialog.component";
import { getAllPositions, createPosition, updatePosition, togglePositionStatus } from "@lib/data/manager/services/position.service";
import { queryClient } from "@lib/infra/query/query.util";
import { getErrorMessage } from "@lib/utils/api-error/api-error.util";
import { format } from "date-fns";
import { cn } from "@lib/utils/cn/cn.util";
import { Link } from "@tanstack/react-router";

export function PositionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<{ id: string; name: string } | null>(null);
  const [newPositionName, setNewPositionName] = useState("");

  const { data: positions, isLoading, refetch } = useQuery({
    queryKey: ["positions"],
    queryFn: getAllPositions,
  });

  const invalidatePositionQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ["positions"] });
    void queryClient.invalidateQueries({ queryKey: ["active-positions"] });
  };

  const createMutation = useMutation({
    mutationFn: (name: string) => createPosition({ name }),
    onSuccess: () => {
      toast.success("Cargo criado com sucesso!");
      invalidatePositionQueries();
      setIsModalOpen(false);
      setNewPositionName("");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Erro ao criar cargo")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updatePosition(id, { name }),
    onSuccess: () => {
      toast.success("Cargo atualizado com sucesso!");
      invalidatePositionQueries();
      setIsModalOpen(false);
      setEditingPosition(null);
      setNewPositionName("");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Erro ao atualizar cargo")),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => togglePositionStatus(id),
    onSuccess: () => {
      toast.success("Status do cargo atualizado!");
      invalidatePositionQueries();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Erro ao alternar status do cargo")),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPositionName.trim()) return;

    if (editingPosition) {
      updateMutation.mutate({ id: editingPosition.id, name: newPositionName });
    } else {
      createMutation.mutate(newPositionName);
    }
  };

  const filteredPositions = positions?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <div className="flex justify-center p-12"><Spinner className="w-8 h-8" /></div>;

  return (
    <div className="flex flex-col gap-8">
      <header className="bg-card rounded-[2.5rem] shadow-neumorph p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8 border border-white/20">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            aria-label="Voltar"
            className="size-12 shrink-0 bg-card shadow-neumorph-convex rounded-2xl border border-white/40 inline-flex items-center justify-center text-primary transition-none hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronLeft className="size-6" strokeWidth={3} />
          </Link>

          <div>
            <h1 className="text-3xl font-black text-foreground leading-tight tracking-tight">Catálogo de Cargos</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">Gerencie os cargos disponíveis para os colaboradores</p>
          </div>
        </div>
        <Button onClick={() => { setEditingPosition(null); setNewPositionName(""); setIsModalOpen(true); }} size="h12" className="font-black px-6 shadow-neumorph-convex">
          <Plus className="w-5 h-5 mr-2" /> Novo Cargo
        </Button>
      </header>

      <div className="bg-card rounded-[2.5rem] shadow-neumorph-pressed p-1 border border-white/10">
        <div className="p-6 border-b border-white/10 flex items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input 
              placeholder="Buscar cargo..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-black/5 dark:bg-white/5 border-white/10 h-12 rounded-2xl"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => void refetch()} className="text-muted-foreground hover:text-primary">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 bg-transparent">
              <TableHead className="font-bold text-foreground/50 uppercase text-[11px] tracking-widest pl-6 h-14">Nome do Cargo</TableHead>
              <TableHead className="font-bold text-foreground/50 uppercase text-[11px] tracking-widest h-14">Status</TableHead>
              <TableHead className="font-bold text-foreground/50 uppercase text-[11px] tracking-widest h-14">Criado em</TableHead>
              <TableHead className="font-bold text-foreground/50 uppercase text-[11px] tracking-widest text-right pr-6 h-14">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPositions.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-48 text-center text-muted-foreground font-medium">Nenhum cargo encontrado.</TableCell></TableRow>
            ) : (
              filteredPositions.map((pos) => (
                <TableRow key={pos.id} className="group hover:bg-white/40 dark:hover:bg-white/5 transition-all border-b border-white/5 last:border-none">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                        <Briefcase className="w-4 h-4 text-primary/60" />
                      </div>
                      <span className="font-bold text-foreground">{pos.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                      pos.active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                      {pos.active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium text-sm">
                    {format(new Date(pos.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        onClick={() => { setEditingPosition({ id: pos.id, name: pos.name }); setNewPositionName(pos.name); setIsModalOpen(true); }}
                        className="text-blue-500 hover:bg-blue-500/10"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        onClick={() => toggleMutation.mutate(pos.id)}
                        className={cn("rounded-md", pos.active ? "text-destructive hover:bg-destructive/10" : "text-emerald-500 hover:bg-emerald-500/10")}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[2.5rem] border-white/20 bg-card shadow-neumorph backdrop-blur-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-center">{editingPosition ? "Editar Cargo" : "Novo Cargo"}</DialogTitle>
              <DialogDescription className="text-center pt-2">
                Defina o nome do cargo para o catálogo do sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <Input 
                value={newPositionName} 
                onChange={(e) => setNewPositionName(e.target.value)}
                placeholder="Ex: Desenvolvedor Fullstack Senior"
                className="bg-black/5 dark:bg-white/5 border-white/10 h-14 rounded-2xl font-bold"
                autoFocus
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold">Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="font-black px-8">
                {(createMutation.isPending || updateMutation.isPending) ? <Spinner className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {editingPosition ? "Salvar Alterações" : "Criar Cargo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
