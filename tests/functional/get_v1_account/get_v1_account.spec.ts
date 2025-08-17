import { expect, test } from '../../../fixture/playwrightFixture';

test.describe('post_v1_account', () => {
  test('test_get_v1_account_auth', async ({ authAccountHelper }) => {
    const response = await authAccountHelper.apiDmAccount.accountApi.getV1Account();
    expect(response.status(), {
      message: 'Не удалось получить данные авторизованного клиента',
    }).toEqual(200);
  });

  test('test_get_v1_account', async ({ accountHelper }) => {
    const response = await accountHelper.apiDmAccount.accountApi.getV1Account();
    expect(response.status(), {
      message: 'Удалось получить данные авторизованного клиента',
    }).toEqual(401);
  });
});
