import { Button } from "@components/sh-button/button.component";
import { Calendar } from "@components/sh-calendar/calendar.component";
import { Checkbox } from "@components/sh-checkbox/checkbox.component";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/sh-dialog/dialog.component";
import { Input } from "@components/sh-input/input.component";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/sh-form/form.component";
import { Field, FieldContent } from "@components/sh-field/field.component";
import { Popover, PopoverContent, PopoverTrigger } from "@components/sh-popover/popover.component";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/sh-select/select.component";
import { Spinner } from "@components/sh-spinner/spinner.component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/sh-tabs/tabs.component";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@lib/cn/cn.util";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  Calendar as CalendarIcon,
  Check,
  Eye,
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
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import type { UserResponseDto } from "@modules/auth/molecule/auth.types";
import { type UpdateUserProfileRequestDto, updateUserProfileSchema } from "@modules/users/molecule/user.schema";
import { updateUserRoles } from "@modules/users/services/user.service";

export function UserDetailsModal({
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
  const frequencyCycleWeeks = useWatch({ control: form.control, name: "inPersonWorkPeriod.frequencyCycleWeeks" });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:max-w-7xl h-[65vh] p-0 border-none shadow-2xl bg-white overflow-hidden flex flex-col sm:flex-row rounded-3xl"
        showCloseButton
      >
        <Tabs orientation="vertical" defaultValue="profile" className="flex flex-col md:flex-row h-full w-full items-stretch">
          {/* LEFT SIDEBAR */}
          <div className="w-full md:w-[280px] bg-gray-50/80 border-r border-gray-100 px-5 py-8 flex flex-col shrink-0 relative overflow-hidden h-full">
            <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] pointer-events-none transform translate-x-12 translate-y-12">
              <Eye className="w-64 h-64" />
            </div>

            <div className="relative z-10 mb-10 pt-4 px-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-2xl mb-6 border border-primary-200/50 shadow-sm">
                <User className="w-6 h-6 text-primary-700" />
              </div>

              <DialogTitle className="text-3xl font-black tracking-tight text-gray-900 mb-2">Detalhes</DialogTitle>

              <DialogDescription className="text-gray-500 text-sm font-medium">
                Perfil de acesso de <br />
                <span className="text-primary-600 font-bold border-b border-primary-200/50 pb-0.5">{user.email}</span>.
              </DialogDescription>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto w-full pr-2">
              <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-2 justify-start items-start">
                <TabsTrigger
                  value="profile"
                  className="w-full justify-start h-12 px-4 rounded-xl text-sm font-bold transition-all text-gray-500 hover:text-gray-900 hover:bg-white data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-primary-100/50 group"
                >
                  <UserCircle className="w-5 h-5 mr-3 opacity-60 group-data-[state=active]:opacity-100 group-data-[state=active]:text-primary-600 transition-all" />
                  Informações do Perfil
                </TabsTrigger>

                <TabsTrigger
                  value="regime"
                  className="w-full justify-start h-12 px-4 rounded-xl text-sm font-bold transition-all text-gray-500 hover:text-gray-900 hover:bg-white data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-indigo-100/50 group"
                >
                  <MapPin className="w-5 h-5 mr-3 opacity-60 group-data-[state=active]:opacity-100 group-data-[state=active]:text-indigo-600 transition-all" />
                  Regime & Localização
                </TabsTrigger>

                <TabsTrigger
                  value="governance"
                  className="w-full justify-start h-12 px-4 rounded-xl text-sm font-bold transition-all text-gray-500 hover:text-gray-900 hover:bg-white data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-amber-100/50 group"
                >
                  <Shield className="w-5 h-5 mr-3 opacity-60 group-data-[state=active]:opacity-100 group-data-[state=active]:text-amber-600 transition-all" />
                  Status & Governança
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-auto px-2 pt-6">
              <Button
                type="button"
                variant="destructive"
                className="w-full h-12 rounded-xl font-bold transition-colors"
                onClick={() => onOpenChange(false)}
              >
                Fechar Janela
              </Button>
            </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col h-full overflow-hidden bg-white relative max-w-full">
              <div className="flex-1 overflow-y-auto px-8 py-10 md:px-12 md:py-12 relative w-full">
                <TabsContent value="profile" className="m-0 space-y-8 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-primary-600" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Informações do Perfil</h3>
                      <p className="text-sm text-gray-500 font-medium">Dados pessoais e profissionais do usuário.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <Field>
                              <FormLabel>Nome de Usuário</FormLabel>
                              <FieldContent>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value || ""}
                                    className={cn(
                                      "h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base font-bold text-gray-800 px-5",
                                    )}
                                    placeholder="Adicione um nome de usuário"
                                  />
                                </FormControl>
                              </FieldContent>
                              <FormMessage />
                            </Field>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="sm:col-span-1 border-t border-gray-100 pt-6">
                      <FormField
                        control={form.control}
                        name="registration"
                        render={({ field }) => (
                          <FormItem>
                            <Field>
                              <FormLabel>Matrícula</FormLabel>
                              <FieldContent>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value || ""}
                                    maxLength={6}
                                    className={cn(
                                      "h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base font-bold text-gray-800 px-5",
                                    )}
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

                    <div className="sm:col-span-1 border-t border-gray-100 pt-6">
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <Field>
                              <FormLabel>Cargo / Posição</FormLabel>
                              <FieldContent>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value || ""}
                                    className={cn(
                                      "h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base font-bold text-gray-800 px-5",
                                    )}
                                    placeholder="Posição profissional"
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
                </TabsContent>

                {/* --- REGIME SECTION --- */}
                <TabsContent value="regime" className="m-0 space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* GENERAL SETTINGS CARD */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] space-y-8 relative overflow-hidden">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-indigo-600" />
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Regime & Localização</h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Configurações gerais e modelo de trabalho.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <Field>
                              <FormLabel>Data de Nascimento</FormLabel>
                              <FieldContent>
                                <FormControl>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className={cn(
                                          "w-full h-14 justify-start text-left font-bold rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white transition-all px-5 text-base text-gray-800",
                                          !field.value && "text-muted-foreground",
                                        )}
                                      >
                                        <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                                        {field.value && typeof field.value === "string" ? (
                                          format(parseISO(field.value), "PPP", {
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
                                        onSelect={(date) => field.onChange(date?.toISOString())}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                        selected={field.value && typeof field.value === "string" ? parseISO(field.value) : undefined}
                                        defaultMonth={field.value && typeof field.value === "string" ? parseISO(field.value) : undefined}
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
                              <FormLabel>Regime de Trabalho</FormLabel>
                              <FieldContent>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger className="w-full h-14 min-h-[56px] rounded-2xl bg-gray-50/50 border border-gray-100 px-5 text-base font-bold text-gray-800 focus:ring-indigo-500/20 transition-all">
                                      <SelectValue placeholder="Selecione o regime" />
                                    </SelectTrigger>

                                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                                      <SelectItem value="HOME_WORK" className="rounded-xl py-3 cursor-pointer font-medium">
                                        Remoto (Home Office)
                                      </SelectItem>

                                      <SelectItem value="OFFICE" className="rounded-xl py-3 cursor-pointer font-medium">
                                        Presencial (Escritório)
                                      </SelectItem>

                                      <SelectItem value="HYBRID" className="rounded-xl py-3 cursor-pointer font-medium">
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
                              <Field
                                orientation="horizontal"
                                className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-gray-200"
                              >
                                <FieldContent className="flex-row items-center gap-4">
                                  <FormControl>
                                    <Checkbox
                                      id="livesElsewhere"
                                      checked={field.value || false}
                                      className="w-6 h-6 rounded-[10px] border-2 border-gray-300"
                                      onCheckedChange={(checked) => field.onChange(checked === true)}
                                    />
                                  </FormControl>
                                  <FormLabel htmlFor="livesElsewhere" className="text-base font-bold text-gray-800 cursor-pointer select-none">
                                    Reside fora da cidade principal?
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

                  {/* HYBRID RULES CARD */}
                  {workRegime === "HYBRID" ? (
                    <div className="bg-[#f8f9fe] border border-indigo-100/60 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(79,70,229,0.05)] space-y-8 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden mt-6">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                      <div className="relative z-10 flex items-center gap-4 border-b border-indigo-100/50 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-50 shadow-sm flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-indigo-600" />
                        </div>

                        <div>
                          <span className="text-xl sm:text-2xl font-black text-indigo-950 mb-1 block tracking-tight">
                            Regras do Modelo Híbrido
                          </span>
                          <p className="text-xs sm:text-sm text-indigo-700/70 font-medium">
                            Configure a frequência exigida no escritório para este colaborador.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-8 relative z-10">
                        {/* TOP CONTROLS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <FormField
                            control={form.control}
                            name="inPersonWorkPeriod.frequencyCycleWeeks"
                            render={({ field }) => (
                              <FormItem>
                                <Field>
                                  <FormLabel>Repetir a cada (Semanas)</FormLabel>
                                  <FieldContent>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          min={1}
                                          max={52}
                                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                          value={field.value || ""}
                                          className={cn(
                                            "h-12 w-full sm:w-28 rounded-xl bg-indigo-50/50 border-indigo-100 focus:bg-white transition-all text-lg font-bold px-4 text-center text-indigo-900",
                                          )}
                                        />
                                      </FormControl>

                                      <div className="text-sm font-bold text-indigo-700 bg-indigo-50/80 px-4 py-3 rounded-xl border border-indigo-100/50 flex-1 w-full sm:w-auto flex items-center justify-center sm:justify-start">
                                        {(() => {
                                          const value = frequencyCycleWeeks;
                                          if (typeof value !== "number" || isNaN(value)) return "semanas";
                                          if (value === 52) return "≈ 12 meses";
                                          if (value < 4) return value === 1 ? "semana" : "semanas";

                                          const months = Math.floor(value / 4);
                                          const weeks = value % 4;
                                          const monthText = months === 1 ? "1 mês" : `${months} meses`;

                                          if (weeks === 0) return `≈ ${monthText}`;

                                          const weekText = weeks === 1 ? "1 semana" : `${weeks} semanas`;
                                          return `≈ ${monthText} e ${weekText}`;
                                        })()}
                                      </div>
                                    </div>
                                  </FieldContent>
                                  <FormMessage />
                                </Field>
                              </FormItem>
                            )}
                          />

                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block transition-colors">
                              Modo de Frequência
                            </span>
                            <div className="flex flex-col sm:flex-row bg-gray-50/80 p-1.5 rounded-xl border border-gray-100 w-full sm:w-fit shadow-inner gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  setHybridMode("specific");
                                }}
                                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${hybridMode === "specific" ? "bg-white text-indigo-700 shadow-sm border border-gray-100 hover:bg-white hover:text-indigo-800" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}`}
                              >
                                Dias Específicos
                              </Button>

                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  setHybridMode("consecutive");
                                }}
                                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${hybridMode === "consecutive" ? "bg-white text-indigo-700 shadow-sm border border-gray-100 hover:bg-white hover:text-indigo-800" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}`}
                              >
                                Dias Consecutivos
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* BOTTOM DYNAMIC SETTINGS */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.05)] w-full">
                          <div className={hybridMode === "specific" ? "block animate-in fade-in zoom-in-95 duration-200" : "hidden"}>
                            <FormField
                              control={form.control}
                              name="inPersonWorkPeriod.frequencyWeekMask"
                              render={({ field }) => (
                                <FormItem>
                                  <Field>
                                    <FormLabel>Dias Selecionados</FormLabel>
                                    <FieldContent>
                                      <FormControl>
                                        <div className="flex flex-wrap gap-2">
                                          {(() => {
                                            const mask = typeof field.value === "number" ? field.value : 0;
                                            const DAYS = [
                                              { id: "mon", label: "Seg", val: 1 },
                                              { id: "tue", label: "Ter", val: 2 },
                                              { id: "wed", label: "Qua", val: 4 },
                                              { id: "thu", label: "Qui", val: 8 },
                                              { id: "fri", label: "Sex", val: 16 },
                                              { id: "sat", label: "Sáb", val: 32 },
                                              { id: "sun", label: "Dom", val: 64 },
                                            ];

                                            return DAYS.map((day) => {
                                              const isChecked = (mask & day.val) === day.val;
                                              return (
                                                <Button
                                                  key={day.id}
                                                  type="button"
                                                  variant="outline"
                                                  onClick={() => field.onChange(isChecked ? mask & ~day.val : mask | day.val)}
                                                  className={cn(
                                                    "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black transition-all duration-300 p-0",
                                                    isChecked
                                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border-0 hover:bg-indigo-700 hover:text-white"
                                                      : "bg-white border-2 border-gray-200 text-gray-400 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50",
                                                  )}
                                                >
                                                  {day.label}
                                                </Button>
                                              );
                                            });
                                          })()}
                                        </div>
                                      </FormControl>
                                    </FieldContent>
                                    <FormMessage />
                                  </Field>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className={hybridMode === "consecutive" ? "block animate-in fade-in zoom-in-95 duration-200" : "hidden"}>
                            <FormField
                              control={form.control}
                              name="inPersonWorkPeriod.frequencyDurationDays"
                              render={({ field }) => (
                                <FormItem>
                                  <Field>
                                    <FormLabel>Duração Consecutiva (Dias)</FormLabel>
                                    <FieldContent>
                                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min={1}
                                            value={field.value || ""}
                                            onChange={(event) => field.onChange(event.target.value ? parseInt(event.target.value) : null)}
                                            className={cn(
                                              "h-12 w-full sm:w-28 rounded-xl bg-white border-2 border-gray-200 focus:border-indigo-500 focus:bg-indigo-50/20 transition-all text-lg font-bold px-4 shadow-sm text-center text-indigo-900",
                                            )}
                                          />
                                        </FormControl>
                                        <div className="text-sm font-bold text-gray-500 bg-gray-50/80 px-4 py-3 rounded-xl border border-gray-100 flex-1 w-full sm:w-auto flex items-center justify-center sm:justify-start">
                                          dias seguidos
                                        </div>
                                      </div>
                                    </FieldContent>
                                    <FormMessage />
                                  </Field>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </TabsContent>

                {/* --- GOVERNANCE SECTION --- */}
                <TabsContent value="governance" className="m-0 space-y-8 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">Status & Governança</h3>
                      <p className="text-xs text-gray-500 font-medium">Controle de acesso e auditoria.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: STATUS & ROLES */}
                    <div className="lg:col-span-12 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* STATUS CARD */}
                        <div className="p-6 rounded-3xl bg-gray-50/50 border border-gray-100 flex items-center justify-between gap-6 overflow-hidden relative">
                          <div className="relative z-10 flex flex-col shrink-0">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status da Conta</span>
                            {user.active ? (
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200/50 shadow-sm w-fit">
                                <Check className="w-4 h-4" /> Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold bg-red-100/80 text-red-800 border border-red-200/50 shadow-sm w-fit">
                                <X className="w-4 h-4" /> Bloqueado
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 relative z-10 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 w-10 p-0 rounded-xl border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100 transition-all shadow-sm"
                              onClick={onReset}
                              disabled={isPending}
                              title="Resetar Senha"
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "h-10 px-4 rounded-xl font-bold transition-all shadow-sm text-xs",
                                user.active
                                  ? "border-red-200 bg-red-50/50 text-red-700 hover:bg-red-100"
                                  : "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100",
                              )}
                              onClick={onToggleStatus}
                              disabled={isPending}
                            >
                              {user.active ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2 opacity-70" /> Bloquear
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2 opacity-70" /> Ativar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* AUDIT SUMMARY */}
                        <div className="p-5 rounded-3xl bg-white border border-gray-100 flex flex-col justify-center gap-3">
                          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Activity className="w-3 h-3" /> Data de Ingresso
                            </span>
                            <span className="text-xs font-bold text-gray-800">
                              {user.audit.createdAt ? format(new Date(user.audit.createdAt), "dd/MM/yyyy HH:mm") : "-"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                              <RefreshCw className="w-3 h-3" /> modificação
                            </span>
                            <span className="text-xs font-bold text-amber-700">
                              {user.audit.updatedAt ? format(new Date(user.audit.updatedAt), "dd/MM/yyyy HH:mm") : "-"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                              <User className="w-3 h-3" /> Responsável
                            </span>
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-tighter truncate max-w-[120px]">
                              {user.audit.updatedBy || "system"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ROLE MANAGEMENT - HORIZONTAL */}
                      <div className="p-6 md:p-8 rounded-3xl bg-gray-50/30 border border-gray-100 space-y-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Níveis de Acesso</h4>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 italic">Mínimo 1 cargo exigido</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"].map((role) => (
                            <div
                              key={role}
                              className={cn(
                                "flex flex-col items-start p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                                selectedRoles.includes(role)
                                  ? "bg-white border-primary-300 shadow-md ring-1 ring-primary-100/50"
                                  : "bg-white/40 border-gray-100 hover:border-gray-200 hover:bg-white",
                              )}
                              onClick={() => {
                                if (selectedRoles.includes(role)) {
                                  if (selectedRoles.length > 1) {
                                    setSelectedRoles(selectedRoles.filter((r) => r !== role));
                                  } else {
                                    toast.error("O usuário deve possuir pelo menos um cargo.");
                                  }
                                } else {
                                  setSelectedRoles([...selectedRoles, role]);
                                }
                              }}
                            >
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full border flex items-center justify-center transition-all mb-3",
                                  selectedRoles.includes(role)
                                    ? "bg-primary-600 border-primary-600 shadow-sm"
                                    : "border-gray-300 bg-white group-hover:border-gray-400",
                                )}
                              >
                                {selectedRoles.includes(role) && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <span
                                className={cn(
                                  "text-xs font-black uppercase tracking-tight",
                                  selectedRoles.includes(role) ? "text-primary-900" : "text-gray-500",
                                )}
                              >
                                {role === "ROLE_ADMIN" ? "Admin" : role === "ROLE_MANAGER" ? "Gestor" : "Comum"}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400 mt-0.5">
                                {role === "ROLE_ADMIN" ? "Controle Total" : role === "ROLE_MANAGER" ? "Gestão" : "Acesso Limitado"}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button
                            type="button"
                            variant="default"
                            className="h-11 px-6 rounded-xl font-black text-xs shadow-lg shadow-gray-200 bg-gray-900 hover:bg-black transition-all flex items-center gap-2"
                            disabled={
                              isUpdatingRoles ||
                              isPending ||
                              JSON.stringify([...selectedRoles].sort()) === JSON.stringify([...user.roles].sort())
                            }
                            onClick={async () => {
                              try {
                                setIsUpdatingRoles(true);
                                await updateUserRoles(user.id, selectedRoles);
                                toast.success("Cargos atualizados!");
                                if (onUpdateRoles) onUpdateRoles(selectedRoles);
                              } catch (error) {
                                console.error("Erro:", error);
                                toast.error("Erro na atualização.");
                              } finally {
                                setIsUpdatingRoles(false);
                              }
                            }}
                          >
                            {isUpdatingRoles ? <Spinner className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                            Salvar Cargos
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>

              {/* FLOATING ACTION BAR FOR SUBMIT */}
              <div className="p-5 md:px-8 md:py-6 bg-white border-t border-gray-100 flex items-center justify-between shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-20 relative mt-auto">
                <span className="text-sm font-bold text-gray-400 hidden sm:block">
                  Atenção às alterações realizadas antes de persistir.
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 w-full sm:w-auto sm:hidden rounded-xl px-6 font-bold text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 transition-colors"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    className="h-12 w-full sm:w-auto rounded-xl px-8 font-black text-sm shadow-lg shadow-primary-200/50 bg-primary-600 hover:bg-primary-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    disabled={!form.formState.isValid || form.formState.isSubmitting || isPending}
                  >
                    {form.formState.isSubmitting || isPending ? (
                      <Spinner className="w-4 h-4 mr-2.5" />
                    ) : (
                      <Save className="w-4 h-4 mr-2.5" />
                    )}
                    Persistir Alterações
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
