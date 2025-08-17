import { faker } from '@faker-js/faker';
import { test } from '../../../fixture/playwrightFixture';

test('put_v1_account_password', async ({ accountHelper, prepareUser }) => {
  const user = prepareUser;
  const newPassword = faker.internet.password({ length: 10, memorable: true });

  await accountHelper.registerNewUser(user.login, user.password, user.email);
  await accountHelper.authUser(user.login, user.password);
  await accountHelper.changePassword(user.login, user.email, user.password, newPassword);
  await accountHelper.authUser(user.login, newPassword);
});
