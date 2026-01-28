import { faker } from '@faker-js/faker';
import { subSuite, test } from '../../../fixture/playwrightFixture.js';

test.describe('Тесты на проверку метода PUT v1/account/password', () => {
  test('Проверка смены пароля пользователя', async ({ accountHelper, prepareUser }) => {
    await subSuite('Позитивные тесты');

    const user = prepareUser;
    const newPassword = faker.internet.password({ length: 10, memorable: true });

    await accountHelper.registerNewUser(user.login, user.password, user.email, true);
    await accountHelper.authUser(user.login, user.password);
    await accountHelper.changePassword(user.login, user.email, user.password, newPassword);
    await accountHelper.authUser(user.login, newPassword);
  });
});
