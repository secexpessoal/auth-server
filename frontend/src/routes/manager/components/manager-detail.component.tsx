import { Button } from "@lib/components/sh-button/button.component";
import { Calendar } from "@lib/components/sh-calendar/calendar.component";
import { Checkbox } from "@lib/components/sh-checkbox/checkbox.component";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@lib/components/sh-dialog/dialog.component";
import { Input } from "@lib/components/sh-input/input.component";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@lib/components/sh-form/form.component";
import { Field, FieldContent } from "@lib/components/sh-field/field.component";
import { Popover, PopoverContent, PopoverTrigger } from "@lib/components/sh-popover/popover.component";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@lib/components/sh-select/select.component";
import { Spinner } from "@lib/components/sh-spinner/spinner.component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@lib/components/sh-tabs/tabs.component";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@lib/utils/cn/cn.util";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  Calendar as CalendarIcon,
  Check,
  KeyRound,
  MapPin,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  User,
  UserCheck,
  UserCircle,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import type { UserResponseDto } from "@lib/data/auth/molecule/auth.types";
import { type UpdateUserProfileRequestDto, updateUserProfileSchema } from "@lib/data/manager/molecule/user.schema";
import { updateUserRoles } from "@lib/data/manager/services/user.service";

export function ManagerDetailsModal({
  open,
  onOpenChange,
  user,
  onUpdate,
  onReset,
  onToggleStatus,
  onUpdateRoles,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  onUpdate: (payload: UpdateUserProfileRequestDto) => void;
  onReset: () => void;
  onToggleStatus: () => void;
  onUpdateRoles?: (roles: string[]) => void;
  isPending: boolean;
}) {
  const [hybridMode, setHybridMode] = useState<"specific" | "consecutive">("specific");
  const [prevSignature, setPrevSignature] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);

  const form = useForm<UpdateUserProfileRequestDto>({
    resolver: zodResolver(updateUserProfileSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      position: null,
      workRegime: undefined,
      registration: "",
      livesElsewhere: false,
      birthDate: null,
      inPersonWorkPeriod: null,
    },
  });

  const onSubmit = (value: UpdateUserProfileRequestDto) => {
    const sanitized: UpdateUserProfileRequestDto = {
      ...value,
      birthDate: value.birthDate || null,
      position: value.position?.trim() || null,
      workRegime: value.workRegime || undefined,
      username: value.username?.trim() || undefined,
      registration: value.registration?.trim() || null,
      inPersonWorkPeriod:
        value.workRegime === "HYBRID" && value.inPersonWorkPeriod?.frequencyCycleWeeks
          ? {
              frequencyCycleWeeks: value.inPersonWorkPeriod.frequencyCycleWeeks,
              frequencyWeekMask: value.inPersonWorkPeriod.frequencyWeekMask,
              frequencyDurationDays: value.inPersonWorkPeriod.frequencyDurationDays,
            }
          : null,
    };
    onUpdate(sanitized);
  };

  const currentSignature = open ? String(user?.id) : null;
  if (currentSignature !== prevSignature) {
    setPrevSignature(currentSignature);
    if (open && user) {
      setHybridMode(user.profile.inPersonWorkPeriod?.frequencyDurationDays ? "consecutive" : "specific");
      setSelectedRoles(user.roles);
    }
  }

  useEffect(() => {
    if (open && user) {
      form.reset({
        position: user.profile.position,
        workRegime: user.profile.workRegime,
        username: user.profile.username || "",
        birthDate: user.profile.birthDate || null,
        registration: user.profile.registration || "",
        livesElsewhere: user.profile.livesElsewhere || false,
        inPersonWorkPeriod: {
          frequencyCycleWeeks: user.profile.inPersonWorkPeriod?.frequencyCycleWeeks || 1,
          frequencyWeekMask: user.profile.inPersonWorkPeriod?.frequencyWeekMask || 0,
          frequencyDurationDays: user.profile.inPersonWorkPeriod?.frequencyDurationDays || null,
        },
      });
    }
  }, [open, user, form]);

  const workRegime = useWatch({ control: form.control, name: "workRegime" });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:max-w-7xl h-[85vh] p-0 border-white/20 shadow-neumorph bg-card backdrop-blur-3xl overflow-hidden flex flex-col sm:flex-row rounded-[3rem]"
        showCloseButton
      >
        <Tabs orientation="vertical" defaultValue="profile" className="flex flex-col md:flex-row h-full w-full items-stretch">
          {/* LEFT SIDEBAR */}
          <div className="w-full md:w-[320px] bg-black/5 dark:bg-white/5 border-r border-white/10 px-6 py-10 flex flex-col shrink-0 relative overflow-hidden h-full">
            <div className="relative z-10 mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-card shadow-neumorph-convex rounded-2xl mb-8 border border-white/40">
                <User className="w-8 h-8 text-primary" />
              </div>

              <DialogTitle className="text-3xl font-black tracking-tight text-foreground mb-3">Gerenciar Usuário</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed">
                Configurações avançadas para <br />
                <span className="text-primary font-bold">{user.email}</span>
              </DialogDescription>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto w-full pr-2">
              <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-3 justify-start items-start">
                <TabsTrigger
                  value="profile"
                  className="w-full justify-start h-14 px-5 rounded-md text-sm font-bold transition-all data-[state=active]:bg-card data-[state=active]:shadow-neumorph data-[state=active]:text-primary border border-transparent data-[state=active]:border-white/20 group"
                >
                  <UserCircle className="w-5 h-5 mr-3 opacity-50 group-data-[state=active]:opacity-100 transition-all" />
                  Perfil do Colaborador
                </TabsTrigger>

                <TabsTrigger
                  value="regime"
                  className="w-full justify-start h-14 px-5 rounded-md text-sm font-bold transition-all data-[state=active]:bg-card data-[state=active]:shadow-neumorph data-[state=active]:text-primary border border-transparent data-[state=active]:border-white/20 group"
                >
                  <MapPin className="w-5 h-5 mr-3 opacity-50 group-data-[state=active]:opacity-100 transition-all" />
                  Regime & Localização
                </TabsTrigger>

                <TabsTrigger
                  value="governance"
                  className="w-full justify-start h-14 px-5 rounded-md text-sm font-bold transition-all data-[state=active]:bg-card data-[state=active]:shadow-neumorph data-[state=active]:text-primary border border-transparent data-[state=active]:border-white/20 group"
                >
                  <Shield className="w-5 h-5 mr-3 opacity-50 group-data-[state=active]:opacity-100 transition-all" />
                  Segurança & Acessos
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-auto pt-8">
              <Button
                type="button"
                variant="destructive"
                className="w-full h-12 rounded-md font-black text-xs uppercase tracking-widest shadow-neumorph-convex active:shadow-neumorph-pressed"
                onClick={() => onOpenChange(false)}
              >
                Fechar Janela
              </Button>
            </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative max-w-full">
              <div className="flex-1 overflow-y-auto px-10 py-12 md:px-16 md:py-16 relative w-full">
                <TabsContent value="profile" className="m-0 space-y-10 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-neumorph-pressed space-y-10 relative overflow-hidden">
                    <div className="flex items-center gap-6 border-b border-white/5 pb-8 mb-12">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <UserCircle className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">Informações Pessoais</h3>
                        <p className="text-sm text-muted-foreground font-medium">Dados de identificação e registro corporativo.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <Field>
                                <FormLabel className="font-bold ml-1">Nome Completo</FormLabel>
                                <FieldContent>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value || ""}
                                      className="bg-black/5 dark:bg-white/5 border-white/10"
                                      placeholder="Nome do colaborador"
                                    />
                                  </FormControl>
                                </FieldContent>
                                <FormMessage />
                              </Field>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-1 border-t border-white/5 pt-8">
                        <FormField
                          control={form.control}
                          name="registration"
                          render={({ field }) => (
                            <FormItem>
                              <Field>
                                <FormLabel className="font-bold ml-1">Matrícula</FormLabel>
                                <FieldContent>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value || ""}
                                      maxLength={6}
                                      className="bg-black/5 dark:bg-white/5 border-white/10 font-mono tracking-widest"
                                      placeholder="000000"
                                    />
                                  </FormControl>
                                </FieldContent>
                                <FormMessage />
                              </Field>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-1 border-t border-white/5 pt-8">
                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <Field>
                                <FormLabel className="font-bold ml-1">Cargo Atual</FormLabel>
                                <FieldContent>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value || ""}
                                      className="bg-black/5 dark:bg-white/5 border-white/10"
                                      placeholder="Ex: Desenvolvedor Senior"
                                    />
                                  </FormControl>
                                </FieldContent>
                                <FormMessage />
                              </Field>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* --- REGIME SECTION --- */}
                <TabsContent value="regime" className="m-0 space-y-10 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-neumorph-pressed space-y-10 relative overflow-hidden">
                    <div className="flex items-center gap-6 border-b border-white/10 pb-8">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">Modelo de Trabalho</h3>
                        <p className="text-sm text-muted-foreground font-medium">Localização e regime de contratação.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <Field>
                              <FormLabel className="font-bold ml-1">Data de Nascimento</FormLabel>
                              <FieldContent>
                                <FormControl>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full h-12 justify-start text-left font-bold rounded-md border-white/10 bg-black/5 dark:bg-white/5 px-4",
                                          !field.value && "text-muted-foreground",
                                        )}
                                      >
                                        <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
                                        {field.value && typeof field.value === "string" ? (
                                          format(parseISO(field.value), "dd 'de' MMMM 'de' yyyy", {
                                            locale: ptBR,
                                          })
                                        ) : (
                                          <span>Selecionar data</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-md border-white/20 shadow-2xl bg-card" align="start">
                                      <Calendar
                                        autoFocus
                                        mode="single"
                                        locale={ptBR}
                                        captionLayout="dropdown"
                                        startMonth={new Date(1900, 0)}
                                        endMonth={new Date()}
                                        onSelect={(date) => field.onChange(date?.toISOString())}
                                        selected={field.value && typeof field.value === "string" ? parseISO(field.value) : undefined}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </FormControl>
                              </FieldContent>
                              <FormMessage />
                            </Field>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="workRegime"
                        render={({ field }) => (
                          <FormItem>
                            <Field>
                              <FormLabel className="font-bold ml-1">Regime Contratual</FormLabel>
                              <FieldContent>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger className="w-full h-12 bg-black/5 dark:bg-white/5 border-white/10 font-bold">
                                      <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-white/20 shadow-2xl">
                                      <SelectItem value="HOME_WORK" className="font-bold">
                                        Home Office
                                      </SelectItem>
                                      <SelectItem value="OFFICE" className="font-bold">
                                        Presencial
                                      </SelectItem>
                                      <SelectItem value="HYBRID" className="font-bold">
                                        Híbrido
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FieldContent>
                              <FormMessage />
                            </Field>
                          </FormItem>
                        )}
                      />

                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name="livesElsewhere"
                          render={({ field }) => (
                            <FormItem>
                              <Field orientation="horizontal" className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/10">
                                <FieldContent className="flex-row items-center gap-4">
                                  <FormControl>
                                    <Checkbox
                                      id="livesElsewhere"
                                      checked={field.value || false}
                                      className="w-6 h-6 rounded-lg"
                                      onCheckedChange={(checked) => field.onChange(checked === true)}
                                    />
                                  </FormControl>
                                  <FormLabel htmlFor="livesElsewhere" className="text-sm font-bold text-foreground cursor-pointer select-none">
                                    Reside fora da sede da empresa?
                                  </FormLabel>
                                </FieldContent>
                                <FormMessage />
                              </Field>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {workRegime === "HYBRID" && (
                    <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 sm:p-10 shadow-neumorph space-y-8 animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-4 border-b border-primary/10 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-card border border-white/20 shadow-neumorph-convex flex items-center justify-center">
                          <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-foreground">Configurações Híbridas</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        <FormField
                          control={form.control}
                          name="inPersonWorkPeriod.frequencyCycleWeeks"
                          render={({ field }) => (
                            <FormItem>
                              <Field>
                                <FormLabel className="font-bold">Ciclo de Repetição (Semanas)</FormLabel>
                                <FieldContent>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value ?? ""}
                                      type="number"
                                      min={1}
                                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                                      className="bg-card border-white/10 font-black text-center text-lg"
                                    />
                                  </FormControl>
                                </FieldContent>
                                <FormMessage />
                              </Field>
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block ml-1">Modo de Escala</span>
                          <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-white/5 gap-1.5">
                            <Button
                              type="button"
                              variant={hybridMode === "specific" ? "default" : "ghost"}
                              onClick={() => setHybridMode("specific")}
                              className="flex-1 rounded-md font-bold h-10 text-xs"
                            >
                              Específicos
                            </Button>
                            <Button
                              type="button"
                              variant={hybridMode === "consecutive" ? "default" : "ghost"}
                              onClick={() => setHybridMode("consecutive")}
                              className="flex-1 rounded-md font-bold h-10 text-xs"
                            >
                              Consecutivos
                            </Button>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          {hybridMode === "specific" ? (
                            <FormField
                              control={form.control}
                              name="inPersonWorkPeriod.frequencyWeekMask"
                              render={({ field }) => (
                                <FormItem>
                                  <Field>
                                    <FormLabel className="font-bold ml-1">Dias da Semana Presenciais</FormLabel>
                                    <FieldContent>
                                      <div className="flex flex-wrap gap-2.5">
                                        {[
                                          { label: "S", val: 1 },
                                          { label: "T", val: 2 },
                                          { label: "Q", val: 4 },
                                          { label: "Q", val: 8 },
                                          { label: "S", val: 16 },
                                          { label: "S", val: 32 },
                                          { label: "D", val: 64 },
                                        ].map((day, idx) => {
                                          const mask = field.value || 0;
                                          const isSelected = (mask & day.val) === day.val;
                                          return (
                                            <Button
                                              key={idx}
                                              type="button"
                                              variant={isSelected ? "default" : "outline"}
                                              className="w-12 h-12 rounded-md font-black"
                                              onClick={() => field.onChange(isSelected ? mask & ~day.val : mask | day.val)}
                                            >
                                              {day.label}
                                            </Button>
                                          );
                                        })}
                                      </div>
                                    </FieldContent>
                                  </Field>
                                </FormItem>
                              )}
                            />
                          ) : (
                            <FormField
                              control={form.control}
                              name="inPersonWorkPeriod.frequencyDurationDays"
                              render={({ field }) => (
                                <FormItem>
                                  <Field>
                                    <FormLabel className="font-bold ml-1">Dias Consecutivos no Escritório</FormLabel>
                                    <FieldContent>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min={1}
                                          value={field.value || ""}
                                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                          className="bg-card border-white/10 font-black text-center text-lg h-14"
                                          placeholder="Ex: 5"
                                        />
                                      </FormControl>
                                    </FieldContent>
                                  </Field>
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* --- GOVERNANCE SECTION --- */}
                <TabsContent value="governance" className="m-0 space-y-10 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-neumorph-pressed space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <ShieldAlert className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-foreground">Estado da Conta</h3>
                      </div>

                      <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-white/20 shadow-neumorph-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Status Atual</span>
                          {user.active ? (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-destructive/10 text-destructive border border-destructive/20 uppercase">
                              Bloqueado
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-12 rounded-md font-black text-[10px] uppercase tracking-widest border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                            onClick={onReset}
                            disabled={isPending}
                          >
                            <KeyRound className="w-4 h-4 mr-2" /> Resetar Senha
                          </Button>

                          <Button
                            type="button"
                            variant={user.active ? "destructive" : "success"}
                            className="h-12 rounded-md font-black text-[10px] uppercase tracking-widest"
                            onClick={onToggleStatus}
                            disabled={isPending}
                          >
                            {user.active ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" /> Bloquear
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" /> Ativar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-neumorph-pressed space-y-6">
                      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                        <RefreshCw className="w-4 h-4 text-primary opacity-50" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Auditoria</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-muted-foreground/60">Criação</span>
                          <span className="text-foreground">
                            {user.audit.createdAt ? format(new Date(user.audit.createdAt), "dd/MM/yy HH:mm") : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-muted-foreground/60">Última Alteração</span>
                          <span className="text-primary">
                            {user.audit.updatedAt ? format(new Date(user.audit.updatedAt), "dd/MM/yy HH:mm") : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-muted-foreground/60">Modificado por</span>
                          <span className="text-foreground font-mono uppercase text-xs">{user.audit.updatedBy || "system"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 rounded-[3rem] bg-card border border-white/20 shadow-neumorph space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground">Permissões do Sistema</h3>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-md font-black text-[10px] uppercase tracking-widest h-10 px-6 text-white"
                        disabled={
                          isUpdatingRoles || isPending || JSON.stringify([...selectedRoles].sort()) === JSON.stringify([...user.roles].sort())
                        }
                        onClick={async () => {
                          try {
                            setIsUpdatingRoles(true);
                            await updateUserRoles(user.id, selectedRoles);
                            toast.success("Cargos salvos!");
                            if (onUpdateRoles) onUpdateRoles(selectedRoles);
                          } catch {
                            toast.error("Erro ao salvar.");
                          } finally {
                            setIsUpdatingRoles(false);
                          }
                        }}
                      >
                        {isUpdatingRoles ? <Spinner className="w-3 h-3 text-white" /> : <Save className="w-3 h-3 mr-2 text-white" />} Salvar
                        Permissões
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"].map((role) => (
                        <div
                          key={role}
                          className={cn(
                            "p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col gap-4 relative overflow-hidden",
                            selectedRoles.includes(role)
                              ? "bg-primary/5 border-primary/40 shadow-neumorph-sm"
                              : "bg-black/5 dark:bg-white/5 border-transparent hover:border-white/10",
                          )}
                          onClick={() => {
                            if (selectedRoles.includes(role)) {
                              if (selectedRoles.length > 1) setSelectedRoles(selectedRoles.filter((r) => r !== role));
                              else toast.error("Mínimo 1 permissão.");
                            } else setSelectedRoles([...selectedRoles, role]);
                          }}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                              selectedRoles.includes(role) ? "bg-primary border-primary" : "border-white/20",
                            )}
                          >
                            {selectedRoles.includes(role) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <span
                              className={cn(
                                "text-sm font-black uppercase tracking-tight block",
                                selectedRoles.includes(role) ? "text-primary" : "text-muted-foreground",
                              )}
                            >
                              {role.replace("ROLE_", "")}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground/60 mt-1 block leading-tight">
                              {role === "ROLE_ADMIN" ? "Administrador Master" : role === "ROLE_MANAGER" ? "Gestor do Sistema" : "Usuário Operacional"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </div>

              {/* ACTION BAR */}
              <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/5 flex items-center justify-between backdrop-blur-md">
                <span className="text-xs font-bold text-muted-foreground/40 italic hidden lg:block">
                  As alterações só entram em vigor após persistir os dados.
                </span>
                <div className="flex gap-4 w-full sm:w-auto">
                  <Button
                    type="submit"
                    size="h12"
                    className="flex-1 sm:flex-none px-12 font-black text-sm uppercase tracking-widest shadow-neumorph-convex hover:shadow-neumorph active:shadow-neumorph-pressed transition-all text-white"
                    disabled={!form.formState.isValid || form.formState.isSubmitting || isPending}
                  >
                    {form.formState.isSubmitting || isPending ? (
                      <Spinner className="w-4 h-4 mr-3 text-white" />
                    ) : (
                      <Save className="w-4 h-4 mr-3 text-white" />
                    )}
                    Persistir Dados
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
