import { subSuite, test } from '../../../fixture/playwrightFixture.js';
import { checkStatusCodeHttp } from '../../../checkers/http_checkers.js';
import { GetV1Account } from '../../../checkers/get_v1_account.js';

test.describe('Тесты на проверку метода GET v1/account', () => {
  test('Проверка получения информации об авторизованном пользователе', async ({
    authAccountHelper,
  }) => {
    await subSuite('Позитивные тесты');

    // const response = await authAccountHelper.apiDmAccount.accountApi.getV1Account(false);

    // console.log('AAAA', response);

    await checkStatusCodeHttp(async () => {
      const response = await authAccountHelper.apiDmAccount.accountApi.getV1Account(false);
      await GetV1Account.checkResponseValues(response.body as any);
      return response;
    });
  });

  test('Проверка получения информации о неавторизованном пользователе', async ({
    accountHelper,
  }) => {
    await subSuite('Негативные тесты');

    const resp = await accountHelper.apiDmAccount.accountApi.getV1Account(false);
    await resp.checkError(401, 'User must be authenticated');
  });
});
