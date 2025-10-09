import { z } from 'zod';

export const RegistrationSchema = z
  .object({
    login: z.string(),
    password: z.string(),
    email: z.email(),
  })
  .strict();

export type RegistrationDTO = z.infer<typeof RegistrationSchema>;
