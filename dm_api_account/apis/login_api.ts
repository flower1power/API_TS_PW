import { APIRequestContext, APIResponse } from 'playwright';
import { RestClient } from '../../rest_client/client';
import { LoginCredentialsDTO } from '../models/loginCredentials';
import { UserEnvelopeDTO, UserEnvelopeSchema } from '../models/userDetails';

export class LoginApi extends RestClient {
  async postV1AccountLogin(
    jsonData: LoginCredentialsDTO,
    validateResponse = true,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse | UserEnvelopeDTO> {
    const response = await this.post(`/v1/account/login`, {
      data: jsonData,
      headers: { ...options?.headers },
      ...options,
    });

    if (validateResponse) {
      return UserEnvelopeSchema.parse(await response.json());
    }

    return response;
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
