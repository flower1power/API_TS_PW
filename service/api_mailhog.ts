import { Configuration } from '../rest_client/configuration';
import { MailhogApi } from '../mailhog_api/apis/mailhog_api';

export class ApiMailhog {
  mailhogApi: MailhogApi;

  constructor(private configuration: Configuration) {
    this.mailhogApi = new MailhogApi(this.configuration);
  }
}
