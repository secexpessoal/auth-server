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
  birthDate: z.string().nullable().optional(),
  workRegime: z.enum(["HOME_WORK", "OFFICE", "HYBRID"]).optional(),
  livesElsewhere: z.boolean().optional(),
  inPersonWorkPeriod: z
    .object({
      frequencyCycleWeeks: z.number().int().positive().max(52, "Máximo de 52 semanas"),
      frequencyWeekMask: z.number().int().min(0).max(127, "Máscara inválida"),
      frequencyDurationDays: z.number().int().min(0).max(365, "Máximo de 365 dias").nullable().optional(),
    })
    .superRefine((data, ctx) => {
      const hasMask = data.frequencyWeekMask > 0;
      const hasDuration = !!data.frequencyDurationDays && data.frequencyDurationDays > 0;

      if (!hasMask && !hasDuration) {
        ctx.addIssue({
          code: "custom",
          message: "Selecione ao menos um dia da semana ou informe a duração em dias",
          path: ["frequencyWeekMask"],
        });

        ctx.addIssue({
          code: "custom",
          message: "Informe a duração ou selecione dias específicos",
          path: ["frequencyDurationDays"],
        });
      }

      if (hasMask && hasDuration) {
        ctx.addIssue({
          code: "custom",
          message: "Escolha apenas dias específicos OU período consecutivo, não ambos",
          path: ["frequencyWeekMask"],
        });

        ctx.addIssue({
          code: "custom",
          message: "Escolha apenas dias específicos OU período consecutivo, não ambos",
          path: ["frequencyDurationDays"],
        });
      }

      if (data.frequencyDurationDays && data.frequencyDurationDays > 365) {
        ctx.addIssue({
          code: "custom",
          message: "A duração consecutiva não pode ultrapassar 365 dias",
          path: ["frequencyDurationDays"],
        });
      }
    })
    .nullable()
    .optional(),
});

export type UpdateUserProfileRequestDto = z.infer<typeof updateUserProfileSchema>;
