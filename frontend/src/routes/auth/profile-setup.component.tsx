import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@lib/components/sh-button/button.component";
import { Checkbox } from "@lib/components/sh-checkbox/checkbox.component";
import { DatePicker } from "@lib/components/sh-date-picker/date-picker.component";
import { Field, FieldContent } from "@lib/components/sh-field/field.component";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@lib/components/sh-form/form.component";
import { Input } from "@lib/components/sh-input/input.component";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lib/components/sh-select/select.component";
import { Spinner } from "@lib/components/sh-spinner/spinner.component";
import { ThemeToggle } from "@lib/components/sh-theme-toggle/theme-toggle.component";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@lib/components/sh-tooltip/tooltip.component";
import { getProfile } from "@lib/data/auth/services/auth.service";
import { type CompleteUserProfileFormData, completeUserProfileSchema, type UpdateUserProfileRequestDto } from "@lib/data/manager/molecule/user.schema";
import { getActivePositions } from "@lib/data/manager/services/position.service";
import { changeUserPosition } from "@lib/data/manager/services/user-position.service";
import { updateUserProfile } from "@lib/data/manager/services/user.service";
import { queryClient } from "@lib/infra/query/query.util";
import { useAuthStore } from "@lib/store/auth.store";
import { getErrorMessage, toastValidationFieldErrors } from "@lib/utils/api-error/api-error.util";
import { cn } from "@lib/utils/cn/cn.util";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { Briefcase, Building2, CalendarDays, CheckCircle2, ClipboardCheck, Home, Loader2, MapPin, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

const weekDays = [
  { label: "S", name: "Segunda", value: 1 },
  { label: "T", name: "Terça", value: 2 },
  { label: "Q", name: "Quarta", value: 4 },
  { label: "Q", name: "Quinta", value: 8 },
  { label: "S", name: "Sexta", value: 16 },
  { label: "S", name: "Sábado", value: 32 },
  { label: "D", name: "Domingo", value: 64 },
];

const toDateOnly = (value?: string | null) => {
  if (!value) return null;
  return value.slice(0, 10);
};

const toInstantString = (value?: string | null) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`).toISOString();
  }
  return value;
};

const getProfileFormValues = (profileUser: ReturnType<typeof useAuthStore.getState>["user"]) => ({
  username: profileUser?.profile?.username || "",
  registration: profileUser?.profile?.registration || "",
  position: profileUser?.profile?.position?.name || "",
  birthDate: toDateOnly(profileUser?.profile?.birthDate),
  workRegime: profileUser?.profile?.workRegime || undefined,
  livesElsewhere: profileUser?.profile?.livesElsewhere || false,
  inPersonWorkPeriod: {
    frequencyCycleWeeks: profileUser?.profile?.inPersonWorkPeriod?.frequencyCycleWeeks || 1,
    frequencyWeekMask: profileUser?.profile?.inPersonWorkPeriod?.frequencyWeekMask || 0,
    frequencyDurationDays: profileUser?.profile?.inPersonWorkPeriod?.frequencyDurationDays || null,
  },
});

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, passwordResetRequired, profileSetupRequired, completeProfileSetup, clearAuth } = useAuthStore();
  const redirectUri = new URLSearchParams(window.location.search).get("redirectUri") || undefined;
  const fromPasswordReset = new URLSearchParams(window.location.search).get("fromPasswordReset") === "true";
  const [hybridMode, setHybridMode] = useState<"specific" | "consecutive">(
    user?.profile?.inPersonWorkPeriod?.frequencyDurationDays ? "consecutive" : "specific",
  );
  const [prevProfileSignature, setPrevProfileSignature] = useState<string | null>(
    `${user?.id || ""}:${user?.profile?.inPersonWorkPeriod?.frequencyDurationDays || ""}`,
  );

  const form = useForm<CompleteUserProfileFormData>({
    resolver: zodResolver(completeUserProfileSchema),
    mode: "onChange",
    defaultValues: getProfileFormValues(user),
  });

  const workRegime = useWatch({ control: form.control, name: "workRegime" });
  const weekMask = useWatch({ control: form.control, name: "inPersonWorkPeriod.frequencyWeekMask" }) || 0;

  const { data: activePositions, isLoading: isLoadingPositions } = useQuery({
    queryKey: ["active-positions"],
    queryFn: getActivePositions,
  });

  const { data: profileUser, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile-setup-profile"],
    queryFn: getProfile,
    enabled: isAuthenticated && profileSetupRequired && !passwordResetRequired,
  });

  const hydratedUser = profileUser || user;
  const currentProfileSignature = `${hydratedUser?.id || ""}:${hydratedUser?.profile?.inPersonWorkPeriod?.frequencyDurationDays || ""}`;
  if (currentProfileSignature !== prevProfileSignature) {
    setPrevProfileSignature(currentProfileSignature);
    setHybridMode(hydratedUser?.profile?.inPersonWorkPeriod?.frequencyDurationDays ? "consecutive" : "specific");
  }

  useEffect(() => {
    if (!hydratedUser) return;

    form.reset(getProfileFormValues(hydratedUser));
  }, [form, hydratedUser]);

  useEffect(() => {
    if (workRegime === "HYBRID") {
      if (!form.getValues("inPersonWorkPeriod")) {
        form.setValue(
          "inPersonWorkPeriod",
          { frequencyCycleWeeks: 1, frequencyWeekMask: 0, frequencyDurationDays: null },
          { shouldValidate: true },
        );
      }
      return;
    }

    form.setValue("inPersonWorkPeriod", null, { shouldValidate: true });
  }, [form, workRegime]);

  const profileMutation = useMutation({
    mutationFn: async (values: CompleteUserProfileFormData) => {
      if (!hydratedUser) throw new Error("Usuário não autenticado");

      const selectedPosition = activePositions?.find((position) => position.name === values.position.trim());
      if (!selectedPosition) throw new Error("Cargo selecionado não foi encontrado");

      const payload: UpdateUserProfileRequestDto = {
        username: values.username.trim(),
        registration: values.registration.trim(),
        position: null,
        birthDate: toInstantString(values.birthDate),
        workRegime: values.workRegime,
        livesElsewhere: values.livesElsewhere,
        inPersonWorkPeriod:
          values.workRegime === "HYBRID"
            ? {
                frequencyCycleWeeks: values.inPersonWorkPeriod?.frequencyCycleWeeks || 1,
                frequencyWeekMask: hybridMode === "specific" ? values.inPersonWorkPeriod?.frequencyWeekMask || 0 : 0,
                frequencyDurationDays: hybridMode === "consecutive" ? values.inPersonWorkPeriod?.frequencyDurationDays || null : null,
              }
            : null,
      };

      await updateUserProfile(hydratedUser.id, payload);

      if (hydratedUser.profile?.position?.id !== selectedPosition.id) {
        await changeUserPosition(hydratedUser.id, {
          positionId: selectedPosition.id,
          eventType: "ASSIGNMENT",
          isTemporary: false,
          reason: "Atribuição inicial realizada no setup de perfil",
        });
      }

      return getProfile();
    },
    onSuccess: async (updatedUser) => {
      completeProfileSetup(updatedUser);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile-setup-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["active-positions"] }),
        queryClient.invalidateQueries({ queryKey: ["global-position-history"] }),
        queryClient.invalidateQueries({ queryKey: ["user-position-history", updatedUser.id] }),
      ]);
      toast.success("Perfil configurado com sucesso!");

      if (redirectUri) {
        window.location.replace(redirectUri);
        return;
      }

      if (updatedUser.roles.includes("ROLE_ADMIN")) {
        void navigate({ to: "/dashboard" });
        return;
      }

      clearAuth();
      void navigate({ to: "/login" });
    },
    onError: (error) => {
      if (toastValidationFieldErrors(error, {
        username: "Nome completo",
        registration: "Matrícula",
        position: "Cargo atual",
        workRegime: "Regime de trabalho",
        "inPersonWorkPeriod.frequencyCycleWeeks": "Ciclo de repetição",
        "inPersonWorkPeriod.frequencyWeekMask": "Dias presenciais",
        "inPersonWorkPeriod.frequencyDurationDays": "Dias consecutivos",
      })) {
        return;
      }

      toast.error(getErrorMessage(error, "Erro ao configurar perfil. Revise os dados e tente novamente."));
    },
  });

  const handleHybridModeChange = (mode: "specific" | "consecutive") => {
    setHybridMode(mode);

    if (mode === "specific") {
      form.setValue("inPersonWorkPeriod.frequencyDurationDays", null, { shouldValidate: true, shouldDirty: true });
      return;
    }

    form.setValue("inPersonWorkPeriod.frequencyWeekMask", 0, { shouldValidate: true, shouldDirty: true });
  };

  const toggleWeekDay = (value: number) => {
    const selected = (weekMask & value) === value;
    form.setValue("inPersonWorkPeriod.frequencyWeekMask", selected ? weekMask & ~value : weekMask | value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (passwordResetRequired) return <Navigate to="/reset-password" search={redirectUri ? { redirectUri } : undefined} />;
  if (!profileSetupRequired) return <Navigate to="/" />;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <main className="mx-auto box-border flex min-h-dvh w-full max-w-7xl flex-col justify-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="bg-card rounded-[2.5rem] shadow-neumorph p-5 sm:p-6 border border-white/20 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="size-14 sm:size-16 bg-card shadow-neumorph-convex rounded-3xl border border-white/40 flex items-center justify-center shrink-0">
              <ClipboardCheck className="size-7 sm:size-8 text-primary" />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                {fromPasswordReset ? "Etapa 2 de 2" : "Perfil obrigatório"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Complete seu perfil</h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-64">
            {[
              { label: "Perfil", icon: UserCircle },
              { label: "Regime", icon: MapPin },
              { label: "Cargo", icon: Briefcase },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/20 bg-white/40 p-2.5 shadow-neumorph-sm dark:bg-white/5">
                <item.icon className="mx-auto mb-1.5 size-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => profileMutation.mutate(values))}
            className="bg-card rounded-[2.5rem] shadow-neumorph-pressed border border-white/10 p-1"
          >
            <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-[2.25rem] lg:grid-cols-2">
              <section className="space-y-5 p-5 sm:p-6 border-b border-white/10 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <UserCircle className="size-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground">Identificação</h2>
                    <p className="text-sm font-medium text-muted-foreground">Dados básicos do colaborador</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel className="font-bold ml-1">Nome Completo</FormLabel>
                        <FieldContent>
                          <FormControl>
                            <Input {...field} className="bg-black/5 dark:bg-white/5 border-white/10" placeholder="Nome do colaborador" />
                          </FormControl>
                        </FieldContent>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <Field>
                          <FormLabel className="font-bold ml-1">Nascimento</FormLabel>
                          <FieldContent>
                            <FormControl>
                              <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                                max={new Date().toISOString().slice(0, 10)}
                                placeholder="Selecionar data"
                                className="bg-black/5 dark:bg-white/5 border-white/10"
                              />
                            </FormControl>
                          </FieldContent>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel className="font-bold ml-1">Cargo Atual</FormLabel>
                        <FieldContent>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingPositions || profileMutation.isPending}>
                              <SelectTrigger className="w-full h-12 bg-black/5 dark:bg-white/5 border-white/10 font-bold">
                                <SelectValue placeholder={isLoadingPositions ? "Carregando cargos..." : "Selecione um cargo"} />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-white/20 shadow-2xl">
                                <SelectGroup>
                                  {activePositions?.map((position) => (
                                    <SelectItem key={position.id} value={position.name} className="font-bold">
                                      {position.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FieldContent>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Building2 className="size-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground">Regime de Trabalho</h2>
                    <p className="text-sm font-medium text-muted-foreground">Modelo contratual e presença</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="workRegime"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel className="font-bold ml-1">Regime Contratual</FormLabel>
                        <FieldContent>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ""} disabled={profileMutation.isPending}>
                              <SelectTrigger className="w-full h-12 bg-black/5 dark:bg-white/5 border-white/10 font-bold">
                                <SelectValue placeholder="Selecione o regime" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-white/20 shadow-2xl">
                                <SelectItem value="HOME_WORK" className="font-bold">
                                  <Home className="size-4" /> Home Office
                                </SelectItem>
                                <SelectItem value="OFFICE" className="font-bold">
                                  <Building2 className="size-4" /> Presencial
                                </SelectItem>
                                <SelectItem value="HYBRID" className="font-bold">
                                  <CalendarDays className="size-4" /> Híbrido
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

                <FormField
                  control={form.control}
                  name="livesElsewhere"
                  render={({ field }) => (
                    <FormItem>
                      <Field orientation="horizontal" className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/10">
                        <FieldContent className="flex-row items-center gap-4">
                          <FormControl>
                            <Checkbox
                              id="profileSetupLivesElsewhere"
                              checked={field.value}
                              className="size-6 rounded-lg"
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                            />
                          </FormControl>
                          <FormLabel htmlFor="profileSetupLivesElsewhere" className="text-sm font-bold text-foreground cursor-pointer select-none">
                            Reside fora da sede da empresa
                          </FormLabel>
                        </FieldContent>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                {workRegime === "HYBRID" && (
                  <div className="space-y-4 rounded-[2rem] border border-primary/20 bg-primary/5 p-5 shadow-neumorph">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-2xl bg-card border border-white/20 shadow-neumorph-convex flex items-center justify-center">
                        <CalendarDays className="size-4 text-primary" />
                      </div>
                      <h3 className="text-base font-black text-foreground">Escala Híbrida</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="inPersonWorkPeriod.frequencyCycleWeeks"
                      render={({ field }) => (
                        <FormItem>
                          <Field>
                            <FormLabel className="font-bold ml-1">Ciclo de Repetição (Semanas)</FormLabel>
                            <FieldContent>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={52}
                                  value={field.value ?? 1}
                                  onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : 1)}
                                  className="bg-card border-white/10 font-black text-center"
                                />
                              </FormControl>
                            </FieldContent>
                            <FormMessage />
                          </Field>
                        </FormItem>
                      )}
                    />

                    <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-white/5 gap-1.5">
                      <Button
                        type="button"
                        variant={hybridMode === "specific" ? "default" : "ghost"}
                        onClick={() => handleHybridModeChange("specific")}
                        className="flex-1 rounded-md font-bold h-10 text-xs"
                      >
                        Dias Fixos
                      </Button>
                      <Button
                        type="button"
                        variant={hybridMode === "consecutive" ? "default" : "ghost"}
                        onClick={() => handleHybridModeChange("consecutive")}
                        className="flex-1 rounded-md font-bold h-10 text-xs"
                      >
                        Sequência
                      </Button>
                    </div>

                    {hybridMode === "specific" ? (
                      <FormField
                        control={form.control}
                        name="inPersonWorkPeriod.frequencyWeekMask"
                        render={() => (
                          <FormItem>
                            <Field>
                              <FormLabel className="font-bold ml-1">Dias Presenciais</FormLabel>
                              <FieldContent>
                                <TooltipProvider>
                                  <div className="flex flex-wrap gap-2">
                                    {weekDays.map((day) => {
                                      const selected = (weekMask & day.value) === day.value;
                                      return (
                                        <Tooltip key={day.value}>
                                          <TooltipTrigger asChild>
                                            <Button
                                              type="button"
                                              variant={selected ? "default" : "outline"}
                                              className={cn("size-10 rounded-md font-black", !selected && "bg-card shadow-neumorph-sm")}
                                              onClick={() => toggleWeekDay(day.value)}
                                            >
                                              {day.label}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent sideOffset={6}>{day.name}</TooltipContent>
                                        </Tooltip>
                                      );
                                    })}
                                  </div>
                                </TooltipProvider>
                              </FieldContent>
                              <FormMessage />
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
                              <FormLabel className="font-bold ml-1">Dias Consecutivos</FormLabel>
                              <FieldContent>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={365}
                                    value={field.value || ""}
                                    onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : null)}
                                    className="bg-card border-white/10 font-black text-center"
                                    placeholder="Ex: 5"
                                  />
                                </FormControl>
                              </FieldContent>
                              <FormMessage />
                            </Field>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </section>
            </div>

            <div className="border-t border-white/10 p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                <CheckCircle2 className="size-5 text-primary" />
                <span>Esses dados liberam o acesso aos sistemas integrados.</span>
              </div>
              <Button
                type="submit"
                size="h12"
                className="font-black px-8 shadow-neumorph-convex"
                disabled={!form.formState.isValid || profileMutation.isPending || isLoadingPositions || isLoadingProfile}
              >
                {profileMutation.isPending ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
                Concluir Perfil
              </Button>
            </div>
          </form>
        </Form>

        {isLoadingPositions && (
          <div className="flex items-center justify-center gap-3 text-sm font-bold text-muted-foreground">
            <Spinner className="size-4" />
            Carregando cargos ativos
          </div>
        )}
      </main>
    </div>
  );
}
