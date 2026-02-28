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
      start: z.string().nullable(),
      end: z.string().nullable(),
    })
    .nullable()
    .optional(),
});

export type UpdateUserProfileRequestDto = z.infer<typeof updateUserProfileSchema>;
