import { Configuration } from '../rest_client/configuration';
import { AccountApi } from '../dm_api_account/apis/account_api';
import { LoginApi } from '../dm_api_account/apis/login_api';

export class ApiDmAccount {
  loginApi: LoginApi;
  accountApi: AccountApi;

  constructor(private configuration: Configuration) {
    this.loginApi = new LoginApi(this.configuration);
    this.accountApi = new AccountApi(this.configuration);
  }
}
