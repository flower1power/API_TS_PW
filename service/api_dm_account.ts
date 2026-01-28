import { AccountApi } from '../clients/http/dm_api_account/apis/account_api.js';
import { LoginApi } from '../clients/http/dm_api_account/apis/login_api.js';
import { Configuration } from '../packages/rest_client/configuration.js';

export class ApiDmAccount {
  loginApi: LoginApi;
  accountApi: AccountApi;

  constructor(private configuration: Configuration) {
    this.loginApi = new LoginApi(this.configuration);
    this.accountApi = new AccountApi(this.configuration);
  }
}
