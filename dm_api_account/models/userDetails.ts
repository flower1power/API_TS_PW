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
    login: z.string().optional().default(undefined),
    roles: z.array(z.enum(UserRole)),
    mediumPictureUrl: z.string().optional().default(undefined),
    smallPictureUrl: z.string().optional().default(undefined),
    status: z.string().optional().default(undefined),
    rating: RatingSchema,
    online: z.coerce.date().optional().default(undefined),
    name: z.string().optional().default(undefined),
    location: z.string().optional().default(undefined),
    registration: z.coerce.date().optional().default(undefined),
  })
  .strict();

export const UserEnvelopeSchema = z.object({
  resource: UserSchema,
  metadata: z.record(z.string(), z.string()).optional().default(undefined),
});

export type UserEnvelopeDTO = z.infer<typeof UserEnvelopeSchema>;
