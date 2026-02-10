import { APIRequestContext } from 'playwright';
import { LoginCredentialsDTO } from '../models/loginCredentials.js';
import { UserEnvelopeDTO, UserEnvelopeSchema } from '../models/userDetails.js';
import { ApiResponse, RestClient } from '../../../../packages/rest_client/client.js';
import { step } from 'allure-js-commons';

/**
 * API клиент для аутентификации пользователей.
 * Предоставляет методы для входа в систему с использованием
 * учетных данных пользователя.
 */
export class LoginApi extends RestClient {
  /**
   * Аутентификация пользователя.
   * @param {LoginCredentialsDTO} jsonData - DTO
   * @param validateResponse
   * @param {Parameters<APIRequestContext['post']>[1]} options - Параметры POST запроса
   * @returns {Promise<ApiResponse | UserEnvelopeDTO>} Ответ сервера или DTO
   */
  async postV1AccountLogin(
    jsonData: LoginCredentialsDTO,
    validateResponse = true,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<ApiResponse | UserEnvelopeDTO> {
    return step('Аутентификация пользователя', async () => {
      const response = await this.post(`/v1/account/login`, {
        data: jsonData,
        headers: { ...options?.headers },
        ...options,
      });

      if (validateResponse) {
        await response.check({ statusCode: 200 });
        return response.toMatchSchema(UserEnvelopeSchema);
      }

      return response;
    });
  }
  /**
   * Выход пользователя из системы на текущем устройстве.
   * Требует предварительной авторизации пользователя
   * (токен должен быть установлен в заголовках сессии)
   * @param {Parameters<APIRequestContext['delete']>[1]} options - Параметры POST запроса
   * @returns {Promise<ApiResponse>} Ответ сервера
   */
  async deleteV1AccountLogin(
    options?: Parameters<APIRequestContext['delete']>[1],
  ): Promise<ApiResponse> {
    return step('Выход пользователя из системы на текущем устройстве', async () => {
      return this.delete('/v1/account/login', { ...options });
    });
  }
  /**
   * Выход пользователя из системы на всех устройствах.
   * Требует предварительной авторизации пользователя
   * (токен должен быть установлен в заголовках сессии)
   * @param {Parameters<APIRequestContext['delete']>[1]} options - Параметры DELETE запроса
   * @returns {Promise<ApiResponse>} Ответ сервера
   */
  async deleteV1AccountLoginAll(
    options?: Parameters<APIRequestContext['delete']>[1],
  ): Promise<ApiResponse> {
    return step('Выход пользователя из системы на всех устройствах', async () => {
      return this.delete('/v1/account/login/all', { ...options });
    });
  }
}
