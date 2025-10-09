import { z } from 'zod';

const LoginCredentialsSchema = z
  .object({
    login: z.string(),
    password: z.string(),
    rememberMe: z.boolean().optional().default(true),
  })
  .strict();

export type LoginCredentialsDTO = z.infer<typeof LoginCredentialsSchema>;
