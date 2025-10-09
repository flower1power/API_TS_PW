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

enum DbParseMode {
  COMMON = 'Common',
  INFO = 'Info',
  POST = 'Post',
  CHAT = 'Chat',
}

export enum ColorSchema {
  MODERN = 'Modern',
  PALE = 'Pale',
  CLASSIC = 'Classic',
  CLASSIC_PALE = 'ClassicPale',
  NIGHT = 'Night',
}

const InfoBbTextSchema = z
  .object({
    value: z.string().optional(),
    parseMode: z.enum(Object.values(DbParseMode) as [string, ...string[]]),
  })
  .strict();

const PagingSettingsSchema = z
  .object({
    postsPerPage: z.number().int(),
    commentsPerPage: z.number().int(),
    topicsPerPage: z.number().int(),
    messagesPerPage: z.number().int(),
    entitiesPerPage: z.number().int(),
  })
  .strict();

const UserSettingsSchema = z
  .object({
    colorSchema: z.enum(Object.values(ColorSchema) as [string, ...string[]]),
    nannyGreetingsMessage: z.string().optional(),
    paging: PagingSettingsSchema,
  })
  .strict();

const UserDetailsSchema = z
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
    icq: z.string().optional(),
    skype: z.string().optional(),
    originalPictureUrl: z.string().optional(),
    info: z.string(),
    settings: UserSettingsSchema,
  })
  .strict();

export const UserDetailsEnvelopeSchema = z
  .object({
    resource: UserDetailsSchema,
    metadata: z.string().optional(),
  })
  .strict();

export type UserDetailsEnvelopeDTO = z.infer<typeof UserDetailsEnvelopeSchema>;
