import { ApiResponse } from '../packages/rest_client/api_response.js';
import { isApiResponse } from './http_checkers.js';
import { step, expect } from '../fixture/playwrightFixture.js';
import { UserDetailsEnvelopeDTO } from '../clients/http/dm_api_account/models/userDetailsEnvelope.js';

export class PostV1Account {
  static async checkResponseValues(
    login: string,
    response: ApiResponse | UserDetailsEnvelopeDTO,
  ): Promise<void> {
    await step('Проверка ответа POST v1/account', async () => {
      let user: UserDetailsEnvelopeDTO['resource'];

      if (isApiResponse(response)) {
        user = (response.body as any).resource;
      } else {
        user = response.resource;
      }

      const today = new Date().toISOString().slice(0, 10);
      const registration =
        user.registration instanceof Date
          ? user.registration.toISOString()
          : String(user.registration); // на случай строки

      expect(registration.startsWith(today)).toBeTruthy();

      expect(user.login).toEqual(login);

      if (user.registration && typeof user.registration === 'string') {
        user.registration = new Date(user.registration);
      }

      expect(user.registration).toBeInstanceOf(Date);

      expect(user.rating).toEqual({
        enabled: true,
        quality: 0,
        quantity: 0,
      });
    });
  }
}
