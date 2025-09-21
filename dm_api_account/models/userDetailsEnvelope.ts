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
    value: z.string().optional().default(undefined),
    parseMode: z.nativeEnum(DbParseMode),
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
    colorSchema: z.nativeEnum(ColorSchema),
    nannyGreetingsMessage: z.string().optional().default(undefined),
    paging: PagingSettingsSchema,
  })
  .strict();

const UserDetailsSchema = z
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
    icq: z.string().optional().default(undefined),
    skype: z.string().optional().default(undefined),
    originalPictureUrl: z.string().optional().default(undefined),
    info: z.string(),
    settings: UserSettingsSchema,
  })
  .strict();

export const UserDetailsEnvelopeSchema = z
  .object({
    resource: UserDetailsSchema,
    metadata: z.string().optional().default(undefined),
  })
  .strict();

export type UserDetailsEnvelopeDTO = z.infer<typeof UserDetailsEnvelopeSchema>;
