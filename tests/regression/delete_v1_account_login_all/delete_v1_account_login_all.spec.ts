import { subSuite, test } from '../../../fixture/playwrightFixture.js';

test.describe('Тесты на проверку метода DELETE v1/account/login/all', async () => {
  test('Проверка выхода пользователя со всех устройств', async ({ accountHelper, prepareUser }) => {
    await subSuite('Позитивные тесты');

    await accountHelper.registerAndActivationNewUser(
      prepareUser.login,
      prepareUser.password,
      prepareUser.email,
      true,
    );
    await accountHelper.authUser(prepareUser.login, prepareUser.password);
    await accountHelper.logoutUserAllDevice();
  });
});
