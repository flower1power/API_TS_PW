import { subSuite, test } from '../../../fixture/playwrightFixture.js';
import { UserEnvelopeSchema } from '../../../clients/http/dm_api_account/models/userDetails.js';

test.describe('Тесты на проверку метода POST v1/account/login', () => {
  test('Проверка авторизации пользователя', async ({ accountHelper, prepareUser }) => {
    await subSuite('Позитивные тесты');

    await accountHelper.registerAndActivationNewUser(
      prepareUser.login,
      prepareUser.password,
      prepareUser.email,
      true,
    );
    const res = await accountHelper.userLogin(prepareUser.login, prepareUser.password, true, false);
    await res.check({ statusCode: 200, schema: UserEnvelopeSchema });
  });
});
