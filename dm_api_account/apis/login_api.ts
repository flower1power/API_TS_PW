import { APIRequestContext, APIResponse } from 'playwright';
import { RestClient } from '../../rest_client/client';

export interface UserLoginData {
  login: string;
  password: string;
  rememberMe: boolean;
}

export class LoginApi extends RestClient {
  async postV1AccountLogin(
    jsonData: UserLoginData,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse> {
    return this.post(`/v1/account/login`, {
      data: jsonData,
      headers: { ...options?.headers },
      ...options,
    });
  }

  async deleteV1AccountLogin(
    options?: Parameters<APIRequestContext['delete']>[1],
  ): Promise<APIResponse> {
    return this.delete('/v1/account/login', { ...options });
  }

  async deleteV1AccountLoginAll(
    options?: Parameters<APIRequestContext['delete']>[1],
  ): Promise<APIResponse> {
    return this.delete('/v1/account/login/all', { ...options });
  }
}
