import { APIRequestContext, APIResponse } from 'playwright';
import { RestClient } from '../../rest_client/client';

export class MailhogApi extends RestClient {
  async getApiV2Message(
    limit = 50,
    options?: Parameters<APIRequestContext['get']>[1],
  ): Promise<APIResponse> {
    const params = {
      limit: limit,
    };

    return this.get(`/api/v2/messages`, {
      params: params,
      ignoreHTTPSErrors: true,
      headers: { ...options?.headers },
      ...options,
    });
  }
}
