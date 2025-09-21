import { test } from '../../../fixture/playwrightFixture';

test('post_v1_account_login', async ({ accountHelper, prepareUser }) => {
  await accountHelper.registerNewUser(
    prepareUser.login,
    prepareUser.password,
    prepareUser.email,
    true,
  );
  await accountHelper.userLogin(prepareUser.login, prepareUser.password);
});
