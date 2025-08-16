import test, { expect } from 'playwright/test';
import { faker } from '@faker-js/faker';
import { AccountApi, UserCredentials } from '../../../dm_api_account/apis/account_api';
import { MailhogApi } from '../../../mailhog_api/apis/mailhog_api';
import { getActivationTokenByLogin } from '../shared/token_utils';

test.describe('put_v1_account_token', () => {
  let accountApi: AccountApi;
  let mailhogApi: MailhogApi;

  test.beforeEach(async () => {
    accountApi = new AccountApi('http://5.63.153.31:5051');
    mailhogApi = new MailhogApi('http://5.63.153.31:5025');
  });

  test('put_v1_account_token', async () => {
    const login = faker.internet.username();
    const password = faker.internet.password();
    const email = faker.internet.email();

    let credentialsData: UserCredentials = {
      login: login,
      email: email,
      password: password,
    };

    let response = await accountApi.postV1Account(credentialsData);
    expect(response.status(), { message: 'Пользователь не был создан' }).toEqual(201);

    response = await mailhogApi.getApiV2Message();
    expect(response.status(), { message: 'Письма не были получены' }).toEqual(200);

    let token = await getActivationTokenByLogin(login, response);
    expect(token, { message: `Токен для пользователя ${login}, не был получен` }).not.toBeNull();

    response = await accountApi.putV1AccountToken(token!);
    expect(response.status(), { message: 'Пользователь не был активирован' }).toEqual(200);
  });
});
