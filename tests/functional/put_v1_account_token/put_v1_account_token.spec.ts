import test, { APIResponse, expect } from 'playwright/test';
import { faker } from '@faker-js/faker';
import { AccountApi, UserCredentials } from '../../../dm_api_account/apis/account_api';
import { LoginApi, UserLoginData } from '../../../dm_api_account/apis/login_api';
import { MailhogApi } from '../../../mailhog_api/apis/mailhog_api';

test('put_v1_account_token.spec', async () => {
  const accountApi = new AccountApi('http://5.63.153.31:5051');
  const loginApi = new LoginApi('http://5.63.153.31:5051');
  const mailhogApi = new MailhogApi('http://5.63.153.31:5025');

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

async function getActivationTokenByLogin(
  login: string,
  response: APIResponse,
): Promise<string | undefined> {
  const responseJson = await response.json();

  for (const item of responseJson.items) {
    const userData = JSON.parse(item.Content.Body);
    const userLogin = userData.Login;

    if (userLogin === login) {
      const token = userData.ConfirmationLinkUrl.split('/').at(-1);
      return token;
    }
  }
}
