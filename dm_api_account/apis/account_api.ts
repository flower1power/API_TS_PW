import { APIRequestContext, APIResponse } from 'playwright';
import { RestClient } from '../../rest_client/client';

export interface UserCredentials {
  login: string;
  email: string;
  password: string;
}

export interface RequestChangePassword {
  login: string;
  token: string;
  oldPassword: string;
  newPassword: string;
}

export class AccountApi extends RestClient {
  async postV1Account(
    jsonData: UserCredentials,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse> {
    return this.post(`/v1/account`, {
      headers: { ...options?.headers },
      data: jsonData,
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
      ...options,
    });
  }

  async getV1Account(options?: Parameters<APIRequestContext['get']>[1]): Promise<APIResponse> {
    return this.get(`/v1/account`, { ...options });
  }

  async postV1AccountPassword(
    login: string,
    email: string,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse> {
    return this.post('/v1/account/password', {
      data: {
        login: login,
        email: email,
      },
      ...options,
    });
  }

  async putV1AccountChangePassword(
    jsonData: RequestChangePassword,
    options?: Parameters<APIRequestContext['put']>[1],
  ): Promise<APIResponse> {
    return this.put(`/v1/account/password`, {
      data: jsonData,
      ...options,
    });
  }
}
