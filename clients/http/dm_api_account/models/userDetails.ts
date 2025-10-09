import { z } from 'zod';

export enum UserRole {
  GUEST = 'Guest',
  PLAYER = 'Player',
  ADMINISTRATOR = 'Administrator',
  NANNY_MODERATOR = 'NannyModerator',
  REGULAR_MODERATOR = 'RegularModerator',
  SENIOR_MODERATOR = 'SeniorModerator',
}

export const RatingSchema = z
  .object({
    enabled: z.boolean(),
    quality: z.number().int(),
    quantity: z.number().int(),
  })
  .strict();

const UserSchema = z
  .object({
    login: z.string().optional(),
    roles: z.array(z.enum(Object.values(UserRole) as [string, ...string[]])),
    mediumPictureUrl: z.string().optional(),
    smallPictureUrl: z.string().optional(),
    status: z.string().optional(),
    rating: RatingSchema,
    online: z.coerce.date().optional(),
    name: z.string().optional(),
    location: z.string().optional(),
    registration: z.coerce.date().optional(),
  })
  .strict();

export const UserEnvelopeSchema = z.object({
  resource: UserSchema,
  metadata: z.record(z.string(), z.string()).optional(),
});

export type UserEnvelopeDTO = z.infer<typeof UserEnvelopeSchema>;
