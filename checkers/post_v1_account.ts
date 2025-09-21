import { APIResponse } from 'playwright';
import { UserEnvelopeDTO, UserRole } from '../dm_api_account/models/userDetails';
import { isApiResponse } from './http_checkers';
import { expect } from '../fixture/playwrightFixture';
import { ColorSchema, UserDetailsEnvelopeDTO } from '../dm_api_account/models/userDetailsEnvelope';

export class PostV1Account {
  static async checkResponseValues(
    login: string,
    response: APIResponse | UserDetailsEnvelopeDTO,
  ): Promise<void> {
    let user: UserDetailsEnvelopeDTO['resource'];

    if (isApiResponse(response)) {
      const json = await response.json();
      user = json.resource;
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
  }
}
