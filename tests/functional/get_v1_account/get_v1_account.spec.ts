import { APIResponse } from 'playwright';
import { UserDetailsEnvelopeDTO } from '../../../dm_api_account/models/userDetailsEnvelope';
import { expect, test } from '../../../fixture/playwrightFixture';
import { checkStatusCodeHttp } from '../../../checkers/http_checkers';
import { GetV1Account } from '../../../checkers/get_v1_account';

test.describe('post_v1_account', () => {
  test('test_get_v1_account_auth', async ({ authAccountHelper }) => {
    await checkStatusCodeHttp(async () => {
      const response = await authAccountHelper.apiDmAccount.accountApi.getV1Account(false);
      GetV1Account.checkResponseValues(await response.json());
      return response;
    });
  });

  test('test_get_v1_account', async ({ accountHelper }) => {
    await checkStatusCodeHttp(() => accountHelper.apiDmAccount.accountApi.getV1Account(false), {
      expectedMessage: 'User must be authenticated',
      expectedStatusCode: 401,
    });
  });
});
