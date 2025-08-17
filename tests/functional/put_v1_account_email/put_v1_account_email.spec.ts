import { faker } from '@faker-js/faker';
import { expect, test } from '../../../fixture/playwrightFixture';
import { errors } from 'playwright';

test('put_v1_account_email', async ({ accountHelper, prepareUser }) => {
  const login = prepareUser.login;
  const password = prepareUser.password;
  const email = prepareUser.email;
  const newEmail = `${prepareUser.login}${faker.string.alpha({ length: { min: 1, max: 5 } })}@mail.ru`;
  const expectedErrorText = 'Пользователь не смог авторизоваться';

  await accountHelper.registerNewUser(login, password, email);
  await accountHelper.userLogin(login, password);
  await accountHelper.changeEmail(login, password, newEmail);

  try {
    await accountHelper.userLogin(login, password);
    test.fail(false, 'Ожидалась ошибка авторизации, но она не произошла.');
  } catch (e) {
    if (e instanceof Error) {
      expect(e.message).toContain(expectedErrorText);
    } else {
      test.fail(false, `Перехвачено не-ошибка значение: ${e}`);
    }
  }

  const token = await accountHelper.getActivationTokenByLogin(login);
  await accountHelper.activateUser(token!);
  await accountHelper.userLogin(login, password);
});
