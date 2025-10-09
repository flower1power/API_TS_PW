import { APIResponse } from 'playwright';
import { isApiResponse } from './http_checkers';
import { expect } from '../fixture/playwrightFixture';
import {
  UserDetailsEnvelopeDTO,
  UserRole,
  ColorSchema,
} from '../clients/http/dm_api_account/models/userDetailsEnvelope';
import { ok } from 'assert/strict';
import { step } from '../fixture/playwrightFixture';

export class GetV1Account {
  static async checkResponseValues(response: APIResponse | UserDetailsEnvelopeDTO): Promise<void> {
    await step('Проверка ответа метода GET v1_account', async () => {
      let user: UserDetailsEnvelopeDTO['resource'];

      if (isApiResponse(response)) {
        const json = await response.json();
        user = json.resource;
      } else {
        user = response.resource;
      }

      if (user.online && typeof user.online === 'string') {
        user.online = new Date(user.online);
      }
      if (user.registration && typeof user.registration === 'string') {
        user.registration = new Date(user.registration);
      }

      ok(user.online);
      ok(user.registration);

      user.online = new Date(user.online);
      user.registration = new Date(user.registration);

      expect(String(user.login).startsWith('DarrenDalton12_08_2025_22_43_04')).toBeTruthy();
      expect(user.roles).toContain(UserRole.GUEST);
      expect(user.roles).toContain(UserRole.PLAYER);
      expect(user.roles).toHaveLength(2);

      expect(user.online).toBeInstanceOf(Date);
      expect(user.registration).toBeInstanceOf(Date);

      expect(user.info).toBe('');
      expect(user.mediumPictureUrl).toBeUndefined();
      expect(user.smallPictureUrl).toBeUndefined();
      expect(user.status).toBeUndefined();
      expect(user.name).toBeUndefined();
      expect(user.location).toBeUndefined();
      expect(user.icq).toBeUndefined();
      expect(user.skype).toBeUndefined();
      expect(user.originalPictureUrl).toBeUndefined();

      expect(user.rating).toEqual({
        enabled: true,
        quality: 0,
        quantity: 0,
      });

      expect(user.settings.colorSchema).toBe(ColorSchema.MODERN);
      expect(user.settings.nannyGreetingsMessage).toBeUndefined();

      expect(user.settings.paging.postsPerPage).toBe(10);
      expect(user.settings.paging.commentsPerPage).toBe(10);
      expect(user.settings.paging.topicsPerPage).toBe(10);
      expect(user.settings.paging.messagesPerPage).toBe(10);
      expect(user.settings.paging.entitiesPerPage).toBe(10);
    });
  }
}
