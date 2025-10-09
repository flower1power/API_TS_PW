import { subSuite, test } from '../../../fixture/playwrightFixture';

test.describe('Тесты на проверку метода POST v1/account/login', () => {
  test('Проверка авторизации пользователя', async ({ accountHelper, prepareUser }) => {
    await subSuite('Позитивные тесты');

    await accountHelper.registerNewUser(
      prepareUser.login,
      prepareUser.password,
      prepareUser.email,
      true,
    );
    await accountHelper.userLogin(prepareUser.login, prepareUser.password);
  });
});
