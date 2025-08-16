import { APIRequestContext, APIResponse } from 'playwright';
import { RestClient } from '../../rest_client/client';

export interface UserCredentials {
  login: string;
  email: string;
  password: string;
}

export class AccountApi extends RestClient {
  async postV1Account(
    jsonData: UserCredentials,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse> {
    return this.post(`/v1/account`, {
      data: jsonData,
      headers: { ...options?.headers },
      ...options,
    });
  }

  async putV1AccountToken(
    token: string,
    options?: Parameters<APIRequestContext['put']>[1],
  ): Promise<APIResponse> {
    return this.put(`/v1/account/${token}`, {
      headers: { accept: 'text/plain', ...options?.headers },
      ...options,
    });
  }

  async putV1AccountChangeEmail(
    jsonData: UserCredentials,
    options?: Parameters<APIRequestContext['put']>[1],
  ): Promise<APIResponse> {
    return this.put(`/v1/account/email`, {
      data: jsonData,
      headers: { ...options?.headers },
      ...options,
    });
  }
}
