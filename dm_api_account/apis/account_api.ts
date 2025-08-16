import { APIRequestContext, APIResponse, request } from 'playwright';

export interface UserCredentials {
  login: string;
  email: string;
  password: string;
}

export class AccountApi {
  host: string;
  headers: string | null;

  constructor(host: string, headers: string | null = null) {
    this.host = host;
    this.headers = headers;
  }

  async postV1Account(jsonData: UserCredentials): Promise<APIResponse> {
    const context = await request.newContext();
    return context.post(`${this.host}/v1/account`, { data: jsonData });
  }

  async putV1AccountToken(token: string): Promise<APIResponse> {
    const headers = {
      accept: 'text/plain',
    };

    const context = await request.newContext();
    return context.put(`${this.host}/v1/account/${token}`, { headers: headers });
  }

  async putV1AccountChangeEmail(jsonData: UserCredentials): Promise<APIResponse> {
    const context = await request.newContext();
    return context.put(`${this.host}/v1/account/email`, { data: jsonData });
  }
}
