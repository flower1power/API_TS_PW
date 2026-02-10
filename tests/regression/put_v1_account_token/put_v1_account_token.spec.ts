import { subSuite, test } from '../../../fixture/playwrightFixture.js';

test.describe('Тесты на проверку метода PUT v1/account/token', () => {
  test('Проверка активации пользователя по токену', async ({ accountHelper, prepareUser }) => {
    await subSuite('Позитивные тесты');

    await accountHelper.registerAndActivationNewUser(
      prepareUser.login,
      prepareUser.password,
      prepareUser.email,
      true,
    );
  });
});
