import { displayName, subSuite, suite, test } from '../../../fixture/playwrightFixture';

test.describe('Тесты на проверку метода DELETE v1/account/login/all', async () => {
  test('Проверка выхода пользователя со всех устройств', async ({ accountHelper, prepareUser }) => {
    await subSuite('Позитивные тесты');

    await accountHelper.registerNewUser(
      prepareUser.login,
      prepareUser.password,
      prepareUser.email,
      true,
    );
    await accountHelper.authUser(prepareUser.login, prepareUser.password);
    await accountHelper.logoutUserAllDevice();
  });
});
