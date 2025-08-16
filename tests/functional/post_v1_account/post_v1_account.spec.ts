import test, { APIResponse, expect } from 'playwright/test';
import { faker } from '@faker-js/faker';
import { AccountApi, UserCredentials } from '../../../dm_api_account/apis/account_api';

test('test_post_v1_account', async () => {
  const accountApi = new AccountApi('http://5.63.153.31:5051');

  const login = faker.internet.username();
  const password = faker.internet.password();
  const email = faker.internet.email();

  const credentialsData: UserCredentials = {
    login: login,
    email: email,
    password: password,
  };

  let response = await accountApi.postV1Account(credentialsData);
  expect(response.status(), { message: 'Пользователь не был создан' }).toEqual(201);
});
