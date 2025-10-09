import { subSuite, test } from '../../../fixture/playwrightFixture';

test.describe('Тесты на проверку метода PUT v1/account/token', () => {
  test('Проверка активации пользователя по токену', async ({ accountHelper, prepareUser }) => {
    await subSuite('Позитивные тесты');

    await accountHelper.registerNewUser(
      prepareUser.login,
      prepareUser.password,
      prepareUser.email,
      true,
    );
  });
});
