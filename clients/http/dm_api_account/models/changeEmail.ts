import { z } from 'zod';

const ChangeEmailSchema = z
  .object({
    login: z.string(),
    password: z.string(),
    email: z.email(),
  })
  .strict();

export type ChangeEmailDTO = z.infer<typeof ChangeEmailSchema>;
