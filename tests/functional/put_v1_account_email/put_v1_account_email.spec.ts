import test, { expect } from 'playwright/test';
import { faker } from '@faker-js/faker';
import { AccountApi, UserCredentials } from '../../../dm_api_account/apis/account_api';
import { LoginApi, UserLoginData } from '../../../dm_api_account/apis/login_api';
import { MailhogApi } from '../../../mailhog_api/apis/mailhog_api';
import { getActivationTokenByLogin } from '../shared/token_utils';

test.describe('put_v1_account_email', () => {
  let accountApi: AccountApi;
  let loginApi: LoginApi;
  let mailhogApi: MailhogApi;

  test.beforeEach(async () => {
    accountApi = new AccountApi('http://5.63.153.31:5051');
    loginApi = new LoginApi('http://5.63.153.31:5051');
    mailhogApi = new MailhogApi('http://5.63.153.31:5025');
  });

  test('put_v1_account_email', async () => {
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

    let loginData: UserLoginData = {
      login: login,
      password: password,
      rememberMe: true,
    };

    response = await loginApi.postV1AccountLogin(loginData);
    expect(response.status(), { message: 'Пользователь не смог авторизоваться' }).toEqual(200);

    credentialsData = {
      login: login,
      password: password,
      email: faker.internet.email(),
    };

    response = await accountApi.putV1AccountChangeEmail(credentialsData);
    expect(response.status(), { message: 'Не удалось изменить почту' }).toEqual(200);
    const json = await response.json();
    expect(json.resource.login).toEqual(login);

    response = await loginApi.postV1AccountLogin(loginData);
    expect(response.status(), { message: 'Удалось войти до активации почты' }).toEqual(403);

    response = await mailhogApi.getApiV2Message();
    expect(response.status(), { message: 'Письма не были получены' }).toEqual(200);

    token = await getActivationTokenByLogin(login, response);
    expect(token, { message: `Токен для пользователя ${login}, не был получен` }).not.toBeNull();

    response = await accountApi.putV1AccountToken(token!);
    expect(response.status(), { message: 'Пользователь не был активирован' }).toEqual(200);

    response = await loginApi.postV1AccountLogin(loginData);
    expect(response.status(), { message: 'Пользователь не смог авторизоваться' }).toEqual(200);
  });
});
