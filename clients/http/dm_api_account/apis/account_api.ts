import { APIRequestContext, APIResponse } from 'playwright';
import { RegistrationDTO, RegistrationSchema } from '../models/registration';
import { UserDetailsEnvelopeDTO, UserDetailsEnvelopeSchema } from '../models/userDetailsEnvelope';
import { UserEnvelopeDTO, UserEnvelopeSchema } from '../models/userDetails';
import { ResetPasswordDTO } from '../models/resetPassword';
import { ChangePasswordDTO } from '../models/changePassword';
import { ChangeEmailDTO } from '../models/changeEmail';
import { RestClient } from '../../../../packages/rest_client/client';
import { step } from '../../../../fixture/playwrightFixture';

/**
 * API клиент для работы с аккаунтами пользователей.
 * Предоставляет методы для регистрации, активации, изменения email
 * и получения информации о пользователе.
 */
export class AccountApi extends RestClient {
  /**
   * Регистрация нового пользователя.
   * @param {RegistrationDTO} jsonData - Данные для регистрации
   * @param {Parameters<APIRequestContext['post']>[1]} options - Параметры POST запроса
   * @returns {Promise<APIResponse>} Ответ сервера
   */
  async postV1Account(
    jsonData: RegistrationDTO,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse> {
    return step('Регистрация нового пользователя', async () => {
      return this.post(`/v1/account`, {
        headers: { ...options?.headers },
        data: jsonData,
        ...options,
      });
    });
  }

  /**
   * Получение информации о текущем пользователе.
   * @param {boolean} validateResponse - Валидация ответа
   * @param {Parameters<APIRequestContext['get']>[1]} options - Параметры GET запроса
   * @returns {Promise<APIResponse | UserDetailsEnvelopeDTO>} Ответ сервера или DTO
   */
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
    return step('Получение информации о текущем пользователе', async () => {
      const response = await this.get(`/v1/account`, { ...options });

      if (validateResponse) {
        return UserDetailsEnvelopeSchema.parse(await response.json());
      }

      return response;
    });
  }

  /**
   * Активация зарегистрированного пользователя по токену.
   * @param {string} token - Валидация ответа
   * @param {boolean} validateResponse - Валидация ответа
   * @param {Parameters<APIRequestContext['put']>[1]} options - Параметры PUT запроса
   * @returns {Promise<APIResponse | UserEnvelopeDTO>} Ответ сервера или DTO
   */
  async putV1AccountToken(
    token: string,
    validateResponse = true,
    options?: Parameters<APIRequestContext['put']>[1],
  ): Promise<APIResponse | UserEnvelopeDTO> {
    return step('Активация зарегистрированного пользователя по токену', async () => {
      const response = await this.put(`/v1/account/${token}`, {
        headers: { accept: 'text/plain', ...options?.headers },
        ...options,
      });

      if (validateResponse) {
        return UserEnvelopeSchema.parse(await response.json());
      }

      return response;
    });
  }

  /**
   * Сброс пароля пользователя.
   * @param {ResetPasswordDTO} loginData - DTO
   * @param {boolean} validateResponse - Валидация ответа
   * @param {Parameters<APIRequestContext['put']>[1]} options - Параметры PUT запроса
   * @returns {Promise<APIResponse | UserEnvelopeDTO>} Ответ сервера или DTO
   */
  async postV1AccountPassword(
    loginData: ResetPasswordDTO,
    validateResponse = true,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse | UserEnvelopeDTO> {
    return step('Сброс пароля пользователя', async () => {
      const response = await this.post('/v1/account/password', {
        data: loginData,
        ...options,
      });

      if (validateResponse) {
        return UserEnvelopeSchema.parse(await response.json());
      }

      return response;
    });
  }

  /**
   * Изменение пароля пользователя.
   * @param {ChangePasswordDTO} changePasswordData - DTO
   * @param {boolean} validateResponse - Валидация ответа
   * @param {Parameters<APIRequestContext['put']>[1]} options - Параметры PUT запроса
   * @returns {Promise<APIResponse | UserEnvelopeDTO>} Ответ сервера или DTO
   */
  async putV1AccountChangePassword(
    changePasswordData: ChangePasswordDTO,
    validateResponse = true,
    options?: Parameters<APIRequestContext['put']>[1],
  ): Promise<APIResponse | UserEnvelopeDTO> {
    return step('Изменение пароля пользователя', async () => {
      const response = await this.put(`/v1/account/password`, {
        data: changePasswordData,
        ...options,
      });

      if (validateResponse) {
        return UserEnvelopeSchema.parse(await response.json());
      }

      return response;
    });
  }

  /**
   * Изменение email адреса зарегистрированного пользователя.
   * @param {ChangeEmailDTO} changeEmailData - DTO
   * @param {boolean} validateResponse - Валидация ответа
   * @param {Parameters<APIRequestContext['put']>[1]} options - Параметры PUT запроса
   * @returns {Promise<APIResponse | UserEnvelopeDTO>} Ответ сервера или DTO
   */
  async putV1AccountChangeEmail(
    changeEmailData: ChangeEmailDTO,
    validateResponse = true,
    options?: Parameters<APIRequestContext['put']>[1],
  ): Promise<APIResponse | UserEnvelopeDTO> {
    return step('Изменение email адреса зарегистрированного пользователя', async () => {
      const response = await this.put(`/v1/account/email`, {
        data: changeEmailData,
        ...options,
      });

      if (validateResponse) {
        return UserEnvelopeSchema.parse(await response.json());
      }

      return response;
    });
  }
}
