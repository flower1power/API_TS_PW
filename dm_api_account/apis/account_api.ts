import { APIRequestContext, APIResponse } from 'playwright';
import { RestClient } from '../../rest_client/client';
import { RegistrationDTO, RegistrationSchema } from '../models/registration';
import { UserDetailsEnvelopeDTO, UserDetailsEnvelopeSchema } from '../models/userDetailsEnvelope';
import { UserEnvelopeDTO, UserEnvelopeSchema } from '../models/userDetails';
import { ResetPasswordDTO } from '../models/resetPassword';
import { ChangePasswordDTO } from '../models/changePassword';
import { ChangeEmailDTO } from '../models/changeEmail';

export class AccountApi extends RestClient {
  async postV1Account(
    jsonData: RegistrationDTO,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse> {
    return this.post(`/v1/account`, {
      headers: { ...options?.headers },
      data: jsonData,
      ...options,
    });
  }

  async getV1Account(
    validateResponse: true,
    options?: Parameters<APIRequestContext['get']>[1],
  ): Promise<UserDetailsEnvelopeDTO>;
  async getV1Account(
    validateResponse: false,
    options?: Parameters<APIRequestContext['get']>[1],
  ): Promise<APIResponse>;
  async getV1Account(
    validateResponse: boolean,
    options?: Parameters<APIRequestContext['get']>[1],
  ): Promise<APIResponse | UserDetailsEnvelopeDTO> {
    const response = await this.get(`/v1/account`, { ...options });

    if (validateResponse) {
      return UserDetailsEnvelopeSchema.parse(await response.json());
    }

    return response;
  }

  async putV1AccountToken(
    token: string,
    validateResponse = true,
    options?: Parameters<APIRequestContext['put']>[1],
  ): Promise<APIResponse | UserEnvelopeDTO> {
    const response = await this.put(`/v1/account/${token}`, {
      headers: { accept: 'text/plain', ...options?.headers },
      ...options,
    });

    if (validateResponse) {
      return UserEnvelopeSchema.parse(await response.json());
    }

    return response;
  }

  async postV1AccountPassword(
    loginData: ResetPasswordDTO,
    validateResponse = true,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse | UserEnvelopeDTO> {
    const response = await this.post('/v1/account/password', {
      data: loginData,
      ...options,
    });

    if (validateResponse) {
      return UserEnvelopeSchema.parse(await response.json());
    }

    return response;
  }

  async putV1AccountChangePassword(
    changePasswordData: ChangePasswordDTO,
    validateResponse = true,
    options?: Parameters<APIRequestContext['put']>[1],
  ): Promise<APIResponse | UserEnvelopeDTO> {
    const response = await this.put(`/v1/account/password`, {
      data: changePasswordData,
      ...options,
    });

    if (validateResponse) {
      return UserEnvelopeSchema.parse(await response.json());
    }

    return response;
  }

  async putV1AccountChangeEmail(
    changeEmailData: ChangeEmailDTO,
    validateResponse = true,
    options?: Parameters<APIRequestContext['put']>[1],
  ): Promise<APIResponse | UserEnvelopeDTO> {
    const response = await this.put(`/v1/account/email`, {
      data: changeEmailData,
      ...options,
    });

    if (validateResponse) {
      return UserEnvelopeSchema.parse(await response.json());
    }

    return response;
  }
}
