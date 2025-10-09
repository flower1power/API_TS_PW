import { faker } from '@faker-js/faker';
import { subSuite, test } from '../../../fixture/playwrightFixture';
import { checkStatusCodeHttp } from '../../../checkers/http_checkers';

test.describe('Тесты на проверку метода PUT v1/account/email', () => {
  test('Проверка смены почты пользователя', async ({ accountHelper, prepareUser }) => {
    await subSuite('Позитивные тесты');

    const login = prepareUser.login;
    const password = prepareUser.password;
    const email = prepareUser.email;
    const newEmail = `${prepareUser.login}${faker.string.alpha({ length: { min: 1, max: 5 } })}@mail.ru`;

    await accountHelper.registerNewUser(login, password, email, true);
    await accountHelper.userLogin(login, password);
    await accountHelper.changeEmail(login, password, newEmail);

    await checkStatusCodeHttp(() => accountHelper.userLogin(login, password), {
      expectedStatusCode: 403,
      expectedMessage: 'User is inactive. Address the technical support for more details',
    });

    const token = await accountHelper.getActivationTokenByLogin(login);
    await accountHelper.activateUser(token!);
    await accountHelper.userLogin(login, password);
  });
});
