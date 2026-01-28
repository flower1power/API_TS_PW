import { subSuite, test } from '../../../fixture/playwrightFixture.js';
import { checkStatusCodeHttp } from '../../../checkers/http_checkers.js';
import { GetV1Account } from '../../../checkers/get_v1_account.js';

test.describe('Тесты на проверку метода GET v1/account', () => {
  test('Проверка получения информации об авторизованном пользователе', async ({
    authAccountHelper,
  }) => {
    await subSuite('Позитивные тесты');

    await checkStatusCodeHttp(async () => {
      const response = await authAccountHelper.apiDmAccount.accountApi.getV1Account(false);
      await GetV1Account.checkResponseValues(await response.json());
      return response;
    });
  });

  test('Проверка получения информации о неавторизованном пользователе', async ({
    accountHelper,
  }) => {
    await subSuite('Негативные тесты');
    await checkStatusCodeHttp(() => accountHelper.apiDmAccount.accountApi.getV1Account(false), {
      expectedMessage: 'User must be authenticated',
      expectedStatusCode: 401,
    });
  });
});
