import { APIRequestContext, APIResponse, request } from 'playwright';

export class MailhogApi {
  host: string;
  headers: string | null;

  constructor(host: string, headers: string | null = null) {
    this.host = host;
    this.headers = headers;
  }

  async getApiV2Message(limit = 50): Promise<APIResponse> {
    const params = {
      limit: limit,
    };

    const context = await request.newContext();
    return context.get(`${this.host}/api/v2/messages`, {
      params: params,
      ignoreHTTPSErrors: true,
    });
  }
}
