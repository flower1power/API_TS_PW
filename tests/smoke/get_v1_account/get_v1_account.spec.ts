import { subSuite, suite, test } from '../../../fixture/playwrightFixture';
import { checkStatusCodeHttp } from '../../../checkers/http_checkers';
import { GetV1Account } from '../../../checkers/get_v1_account';

test.describe('Тесты на проверку метода GET v1/account', () => {
  test('Проверка получения информации об авторизованном пользователе', async ({
    authAccountHelper,
  }) => {
    await subSuite('Позитивные тесты');

    await checkStatusCodeHttp(async () => {
      const response = await authAccountHelper.apiDmAccount.accountApi.getV1Account(false);
      GetV1Account.checkResponseValues(await response.json());
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
