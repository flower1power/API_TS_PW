import { MailhogApi } from '../clients/http/mailhog_api/apis/mailhog_api.js';
import { Configuration } from '../packages/rest_client/configuration.js';

export class ApiMailhog {
  mailhogApi: MailhogApi;

  constructor(private configuration: Configuration) {
    this.mailhogApi = new MailhogApi(this.configuration);
  }
}
