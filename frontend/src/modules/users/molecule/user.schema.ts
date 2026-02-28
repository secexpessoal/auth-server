import { z } from "zod";

export const registerAdminSchema = z.object({
  username: z
    .string()
    .min(3, "O nome de usuário deve ter no mínimo 3 caracteres")
    .max(100, "O nome de usuário deve ter no máximo 100 caracteres")
    .nonempty("O nome de usuário não pode estar em branco"),
  email: z.email("O e-mail deve ser válido").nonempty("O e-mail não pode estar em branco"),
});

export type RegisterAdminFormData = z.infer<typeof registerAdminSchema>;

export const updateUserProfileSchema = z.object({
  username: z.string().optional(),
  registration: z.string().max(6, "A matrícula deve ter no máximo 6 caracteres").nullable().optional(),
  position: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  work_regime: z.enum(["HOME_WORK", "OFFICE", "HYBRID"]).optional(),
  lives_elsewhere: z.boolean().optional(),
  in_person_work_period: z
    .object({
      frequency_cycle_weeks: z.number().int().positive().max(52, "Máximo de 52 semanas"),
      frequency_week_mask: z.number().int().min(1).max(127, "Máscara inválida"),
      frequency_duration_days: z.number().int().positive().max(365, "Máximo de 365 dias").nullable().optional(),
    })
    .superRefine((data, ctx) => {
      const hasMask = data.frequency_week_mask > 0;
      const hasDuration = !!data.frequency_duration_days;

      if (hasMask && hasDuration) {
        ctx.addIssue({
          code: "custom",
          message: "Escolha apenas dias específicos OU período consecutivo, não ambos",
          path: ["frequency_week_mask"],
        });

        ctx.addIssue({
          code: "custom",
          message: "Escolha apenas dias específicos OU período consecutivo, não ambos",
          path: ["frequency_duration_days"],
        });
      }

      if (data.frequency_duration_days && data.frequency_duration_days > 365) {
        ctx.addIssue({
          code: "custom",
          message: "A duração consecutiva não pode ultrapassar 365 dias",
          path: ["frequency_duration_days"],
        });
      }
    })
    .nullable()
    .optional(),
});

export type UpdateUserProfileRequestDto = z.infer<typeof updateUserProfileSchema>;
