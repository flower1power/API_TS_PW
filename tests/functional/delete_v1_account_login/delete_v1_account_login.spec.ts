import { test } from '../../../fixture/playwrightFixture';

test('delete_v1_account_login', async ({ accountHelper, prepareUser }) => {
  await accountHelper.registerNewUser(prepareUser.login, prepareUser.password, prepareUser.email);
  await accountHelper.authUser(prepareUser.login, prepareUser.password);
  await accountHelper.logoutUser();
});
