import { test } from '../../../fixture/playwrightFixture';

test('put_v1_account_token', async ({ accountHelper, prepareUser }) => {
  await accountHelper.registerNewUser(
    prepareUser.login,
    prepareUser.password,
    prepareUser.email,
    true,
  );
});
