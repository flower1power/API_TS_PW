import { AccountApi } from '../clients/http/dm_api_account/apis/account_api';
import { LoginApi } from '../clients/http/dm_api_account/apis/login_api';
import { Configuration } from '../packages/rest_client/configuration';

export class ApiDmAccount {
  loginApi: LoginApi;
  accountApi: AccountApi;

  constructor(private configuration: Configuration) {
    this.loginApi = new LoginApi(this.configuration);
    this.accountApi = new AccountApi(this.configuration);
  }
}
