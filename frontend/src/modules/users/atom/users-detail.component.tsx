import { Button } from "@components/sh-button/button.component";
import { Calendar } from "@components/sh-calendar/calendar.component";
import { Checkbox } from "@components/sh-checkbox/checkbox.component";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/sh-dialog/dialog.component";
import { Input } from "@components/sh-input/input.component";
import { Label } from "@components/sh-label/label.component";
import { Popover, PopoverContent, PopoverTrigger } from "@components/sh-popover/popover.component";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/sh-select/select.component";
import { Spinner } from "@components/sh-spinner/spinner.component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/sh-tabs/tabs.component";
import { cn } from "@lib/cn.util";
import { useForm } from "@tanstack/react-form";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  Calendar as CalendarIcon,
  Check,
  Eye,
  KeyRound,
  MapPin,
  Save,
  Shield,
  ShieldAlert,
  UserCheck,
  UserCircle,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import type { UserResponseDto } from "../../auth/molecule/auth.types";
import { type UpdateUserProfileRequestDto, updateUserProfileSchema } from "../molecule/user.schema";

export function UserDetailsModal({
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
  const [hybridMode, setHybridMode] = useState<"specific" | "consecutive">("specific");

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const formOptions = useMemo(
    () => ({
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
      onSubmit: async ({ value }: { value: UpdateUserProfileRequestDto }) => {
        const sanitized: UpdateUserProfileRequestDto = {
          ...value,
          birth_date: value.birth_date || null,
          position: value.position?.trim() || null,
          work_regime: value.work_regime || undefined,
          username: value.username?.trim() || undefined,
          registration: value.registration?.trim() || null,
          in_person_work_period:
            value.work_regime === "HYBRID" && value.in_person_work_period?.frequency_cycle_weeks
              ? {
                  frequency_cycle_weeks: value.in_person_work_period.frequency_cycle_weeks,
                  frequency_week_mask: value.in_person_work_period.frequency_week_mask,
                  frequency_duration_days: value.in_person_work_period.frequency_duration_days,
                }
              : null,
        };
        onUpdateRef.current(sanitized);
      },
    }),
    [],
  );

  const form = useForm(formOptions);

  useEffect(() => {
    if (open && user) {
      form.reset({
        position: user.profile.position,
        work_regime: user.profile.work_regime,
        username: user.profile.username || "",
        birth_date: user.profile.birth_date || null,
        registration: user.profile.registration || "",
        lives_elsewhere: user.profile.lives_elsewhere || false,
        in_person_work_period: {
          frequency_cycle_weeks: user.profile.in_person_work_period?.frequency_cycle_weeks || 1,
          frequency_week_mask: user.profile.in_person_work_period?.frequency_week_mask || 0,
          frequency_duration_days: user.profile.in_person_work_period?.frequency_duration_days || null,
        },
      });
      setHybridMode(user.profile.in_person_work_period?.frequency_duration_days ? "consecutive" : "specific");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

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
                <Eye className="w-6 h-6 text-primary-700" />
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
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
            className="flex-1 flex flex-col h-full overflow-hidden bg-white relative max-w-full"
          >
            <div className="flex-1 overflow-y-auto px-8 py-10 md:px-12 md:py-12 relative w-full">
              {/* --- PROFILE SECTION --- */}
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
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome de Usuário</Label>
                    <form.Field
                      name="username"
                      children={(field) => (
                        <div className="space-y-1.5">
                          <Input
                            id={field.name}
                            value={field.state.value || ""}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            className={cn(
                              "h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base font-bold text-gray-800 px-5",
                              field.state.meta.errors.length > 0 && "border-red-400 bg-red-50/30",
                            )}
                            placeholder="Adicione um nome de usuário"
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-left-2 mt-2">
                              <ShieldAlert className="w-3 h-3" />
                              {field.state.meta.errors[0]?.message || field.state.meta.errors[0]?.toString()}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-1 border-t border-gray-100 pt-6">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Matrícula</Label>
                    <form.Field
                      name="registration"
                      children={(field) => (
                        <div className="space-y-1.5">
                          <Input
                            id={field.name}
                            maxLength={6}
                            onBlur={field.handleBlur}
                            value={field.state.value || ""}
                            onChange={(event) => field.handleChange(event.target.value)}
                            className={cn(
                              "h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base font-bold text-gray-800 px-5",
                              field.state.meta.errors.length > 0 && "border-red-400 bg-red-50/30",
                            )}
                            placeholder="000000"
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-left-2 mt-2">
                              <ShieldAlert className="w-3 h-3" />
                              {field.state.meta.errors[0]?.message || field.state.meta.errors[0]?.toString()}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-1 border-t border-gray-100 pt-6">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Cargo / Posição</Label>
                    <form.Field
                      name="position"
                      children={(field) => (
                        <div className="space-y-1.5">
                          <Input
                            id={field.name}
                            value={field.state.value || ""}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            className={cn(
                              "h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base font-bold text-gray-800 px-5",
                              field.state.meta.errors.length > 0 && "border-red-400 bg-red-50/30",
                            )}
                            placeholder="Posição profissional"
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-left-2 mt-2">
                              <ShieldAlert className="w-3 h-3" />
                              {field.state.meta.errors[0]?.message || field.state.meta.errors[0]?.toString()}
                            </p>
                          )}
                        </div>
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
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Data de Nascimento</Label>
                      <form.Field
                        name="birth_date"
                        children={(field) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full h-14 justify-start text-left font-bold rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white transition-all px-5 text-base text-gray-800",
                                  !field.state.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
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
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Regime de Trabalho</Label>
                      <form.Field
                        name="work_regime"
                        children={(field) => (
                          <Select onValueChange={(val: "HOME_WORK" | "OFFICE" | "HYBRID") => field.handleChange(val)} value={field.state.value || ""}>
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
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-4 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 sm:col-span-2 shadow-sm transition-all hover:border-gray-200">
                      <form.Field
                        name="lives_elsewhere"
                        children={(field) => (
                          <>
                            <Checkbox
                              id="lives_elsewhere"
                              checked={field.state.value || false}
                              onCheckedChange={(checked) => field.handleChange(checked === true)}
                              className="w-6 h-6 rounded-[10px] border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 data-[state=checked]:border-indigo-600"
                            />
                            <Label htmlFor="lives_elsewhere" className="text-base font-bold text-gray-800 cursor-pointer ml-2 select-none">
                              Reside fora da cidade principal?
                            </Label>
                          </>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* HYBRID RULES CARD */}
                <form.Subscribe
                  selector={(state) => state.values.work_regime}
                  children={(workRegime) =>
                    workRegime === "HYBRID" ? (
                      <div className="bg-[#f8f9fe] border border-indigo-100/60 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(79,70,229,0.05)] space-y-8 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden mt-6">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-4 border-b border-indigo-100/50 pb-6">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-50 shadow-sm flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <Label className="text-xl sm:text-2xl font-black text-indigo-950 mb-1 block tracking-tight">
                              Regras do Modelo Híbrido
                            </Label>
                            <p className="text-xs sm:text-sm text-indigo-700/70 font-medium">
                              Configure a frequência exigida no escritório para este colaborador.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-8 relative z-10">
                          {/* TOP CONTROLS */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <form.Field
                              name="in_person_work_period.frequency_cycle_weeks"
                              children={(field) => (
                                <div className="space-y-3">
                                  <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Repetir a cada (Semanas)
                                  </Label>
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <Input
                                      type="number"
                                      min={1}
                                      max={52}
                                      value={field.state.value ?? ""}
                                      onChange={(event) => field.handleChange(parseInt(event.target.value) || 0)}
                                      className={cn(
                                        "h-12 w-full sm:w-28 rounded-xl bg-indigo-50/50 border-indigo-100 focus:bg-white transition-all text-lg font-bold px-4 text-center text-indigo-900",
                                        field.state.meta.errors.length > 0 && "border-red-400 bg-red-50/30 text-red-900",
                                      )}
                                    />
                                    <div className="text-sm font-bold text-indigo-700 bg-indigo-50/80 px-4 py-3 rounded-xl border border-indigo-100/50 flex-1 w-full sm:w-auto flex items-center justify-center sm:justify-start">
                                      {(() => {
                                        const val = field.state.value;
                                        if (typeof val !== "number") return "semanas";
                                        if (val === 52) return "≈ 12 meses";
                                        if (val === 4) return "≈ 1 mês";
                                        if (val > 4) return `≈ ${Math.floor(val / 4)} meses`;
                                        return "semanas";
                                      })()}
                                    </div>
                                  </div>
                                  {field.state.meta.errors.length > 0 && (
                                    <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-left-2 mt-2">
                                      <ShieldAlert className="w-3 h-3" />
                                      {field.state.meta.errors[0]?.message || field.state.meta.errors[0]?.toString()}
                                    </p>
                                  )}
                                </div>
                              )}
                            />

                            <div className="space-y-4">
                              <Label className="text-[11px] font-black text-gray-400 ml-1 block uppercase tracking-widest">Modo de Frequência</Label>
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
                              <form.Field
                                name="in_person_work_period.frequency_week_mask"
                                children={(field) => {
                                  const mask = typeof field.state.value === "number" ? field.state.value : 0;
                                  const DAYS = [
                                    { id: "mon", label: "Seg", val: 1 },
                                    { id: "tue", label: "Ter", val: 2 },
                                    { id: "wed", label: "Qua", val: 4 },
                                    { id: "thu", label: "Qui", val: 8 },
                                    { id: "fri", label: "Sex", val: 16 },
                                    { id: "sat", label: "Sáb", val: 32 },
                                    { id: "sun", label: "Dom", val: 64 },
                                  ];

                                  return (
                                    <div className="space-y-4">
                                      <Label className="text-[11px] font-black text-gray-400 ml-1 block uppercase tracking-widest">
                                        Dias Selecionados
                                      </Label>
                                      {field.state.meta.errors.length > 0 && (
                                        <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                                          <ShieldAlert className="w-3 h-3" />
                                          {field.state.meta.errors[0]?.message || field.state.meta.errors[0]?.toString()}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-2">
                                        {DAYS.map((day) => {
                                          const isChecked = (mask & day.val) === day.val;
                                          return (
                                            <Button
                                              key={day.id}
                                              type="button"
                                              variant="outline"
                                              onClick={() => field.handleChange(isChecked ? mask & ~day.val : mask | day.val)}
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
                                        })}
                                      </div>
                                    </div>
                                  );
                                }}
                              />
                            </div>
                            <div className={hybridMode === "consecutive" ? "block animate-in fade-in zoom-in-95 duration-200" : "hidden"}>
                              <form.Field
                                name="in_person_work_period.frequency_duration_days"
                                children={(field) => (
                                  <div className="space-y-3">
                                    <Label className="text-[11px] font-black text-gray-400 ml-1 uppercase tracking-widest">
                                      Duração Consecutiva (Dias)
                                    </Label>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                      <Input
                                        type="number"
                                        min={1}
                                        value={field.state.value || ""}
                                        onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : null)}
                                        className={cn(
                                          "h-12 w-full sm:w-28 rounded-xl bg-white border-2 border-gray-200 focus:border-indigo-500 focus:bg-indigo-50/20 transition-all text-lg font-bold px-4 shadow-sm text-center text-indigo-900",
                                          field.state.meta.errors.length > 0 && "border-red-400 bg-red-50/30",
                                        )}
                                      />
                                      <div className="text-sm font-bold text-gray-500 bg-gray-50/80 px-4 py-3 rounded-xl border border-gray-100 flex-1 w-full sm:w-auto flex items-center justify-center sm:justify-start">
                                        dias seguidos
                                      </div>
                                    </div>
                                    {field.state.meta.errors.length > 0 && (
                                      <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-left-2 mt-2">
                                        <ShieldAlert className="w-3 h-3" />
                                        {field.state.meta.errors[0]?.message || field.state.meta.errors[0]?.toString()}
                                      </p>
                                    )}
                                  </div>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null
                  }
                />
              </TabsContent>

              {/* --- GOVERNANCE SECTION --- */}
              <TabsContent value="governance" className="m-0 space-y-8 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Status & Governança</h3>
                    <p className="text-sm text-gray-500 font-medium">Controle de acesso do sistema.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <div className="p-8 rounded-3xl bg-gray-50/80 border border-gray-100 text-center relative overflow-hidden">
                      <span className="block text-[11px] font-black text-gray-400 uppercase mb-5 tracking-widest">Status Autenticado</span>
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        {user.active ? (
                          <span className="px-6 py-3.5 rounded-2xl text-lg font-bold bg-emerald-100 text-emerald-800 border-2 border-emerald-200/60 flex items-center gap-2 shadow-sm">
                            <Check className="w-6 h-6" /> Ativo Confirmed
                          </span>
                        ) : (
                          <span className="px-6 py-3.5 rounded-2xl text-lg font-bold bg-red-100 text-red-800 border-2 border-red-200/60 flex items-center gap-2 shadow-sm">
                            <X className="w-6 h-6" /> Inativo Blocked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-16 rounded-2xl justify-start font-bold border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 hover:border-amber-300 transition-all px-6 shadow-sm text-base"
                        onClick={onReset}
                        disabled={isPending}
                      >
                        <KeyRound className="w-6 h-6 mr-4 opacity-70" /> Resetar Senha Alpha
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full h-16 rounded-2xl justify-start font-bold transition-all px-6 shadow-sm text-base ${user.active ? "border-red-200 bg-red-50/50 text-red-700 hover:bg-red-100 hover:text-red-800 hover:border-red-300" : "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-300"}`}
                        onClick={onToggleStatus}
                        disabled={isPending}
                      >
                        {user.active ? (
                          <>
                            <UserX className="w-6 h-6 mr-4 opacity-70" /> Bloquear Acesso
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-6 h-6 mr-4 opacity-70" /> Liberar Acesso
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6 bg-gray-50/40 p-8 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-gray-400" />
                      <h4 className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Auditoria Sistêmica</h4>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col p-5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow-md">
                        <span className="text-[11px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Data de Ingresso</span>
                        <span className="text-base font-black text-gray-800">
                          {user.audit.created_at ? format(new Date(user.audit.created_at), "dd/MM/yyyy HH:mm") : "-"}
                        </span>
                      </div>

                      {user.audit.updated_at && (
                        <div className="flex flex-col p-5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow-md">
                          <span className="text-[11px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Última Modificação</span>
                          <span className="text-base font-black text-amber-700">{format(new Date(user.audit.updated_at), "dd/MM/yyyy HH:mm")}</span>
                        </div>
                      )}

                      <div className="flex flex-col p-5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow-md">
                        <span className="text-[11px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Responsável Modificação</span>
                        <span className="text-sm font-black text-primary-600 uppercase tracking-tighter truncate">
                          {user.audit.updated_by || "system"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>

            {/* FLOATING ACTION BAR FOR SUBMIT */}
            <div className="p-5 md:px-8 md:py-6 bg-white border-t border-gray-100 flex items-center justify-between shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-20 relative mt-auto">
              <span className="text-sm font-bold text-gray-400 hidden sm:block">Atenção às alterações realizadas antes de persistir.</span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 w-full sm:w-auto sm:hidden rounded-xl px-6 font-bold text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 transition-colors"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      className="h-12 w-full sm:w-auto rounded-xl px-8 font-black text-sm shadow-lg shadow-primary-200/50 bg-primary-600 hover:bg-primary-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                      disabled={!canSubmit || isSubmitting || isPending}
                    >
                      {isSubmitting || isPending ? <Spinner className="w-4 h-4 mr-2.5" /> : <Save className="w-4 h-4 mr-2.5" />}
                      Persistir Alterações
                    </Button>
                  )}
                />
              </div>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
