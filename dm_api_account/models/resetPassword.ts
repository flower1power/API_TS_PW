import { z } from 'zod';

const ResetPasswordSchema = z
  .object({
    login: z.string(),
    email: z.email(),
  })
  .strict();

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
