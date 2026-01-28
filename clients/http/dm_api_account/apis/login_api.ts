import { APIRequestContext, APIResponse } from 'playwright';
import { LoginCredentialsDTO } from '../models/loginCredentials.js';
import { UserEnvelopeDTO, UserEnvelopeSchema } from '../models/userDetails.js';
import { RestClient } from '../../../../packages/rest_client/client.js';
import { step } from 'allure-js-commons';
import { expect } from '../../../../fixture/playwrightFixture.js';

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
   * @returns {Promise<APIResponse | UserEnvelopeDTO>} Ответ сервера или DTO
   */
  async postV1AccountLogin(
    jsonData: LoginCredentialsDTO,
    validateResponse = true,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse | UserEnvelopeDTO> {
    return step('Аутентификация пользователя', async () => {
      const response = await this.post(`/v1/account/login`, {
        data: jsonData,
        headers: { ...options?.headers },
        ...options,
      });

      if (validateResponse) {
        await expect(response).toHaveStatusCode(200);
        await expect(response).toMatchSchema(UserEnvelopeSchema);

        const responseData = await response.json();
        return UserEnvelopeSchema.parse(responseData);
      }

      return response;
    });
  }
  /**
   * Выход пользователя из системы на текущем устройстве.
   * Требует предварительной авторизации пользователя
   * (токен должен быть установлен в заголовках сессии)
   * @param {Parameters<APIRequestContext['delete']>[1]} options - Параметры POST запроса
   * @returns {Promise<APIResponse>} Ответ сервера
   */
  async deleteV1AccountLogin(
    options?: Parameters<APIRequestContext['delete']>[1],
  ): Promise<APIResponse> {
    return step('Выход пользователя из системы на текущем устройстве', async () => {
      return this.delete('/v1/account/login', { ...options });
    });
  }
  /**
   * Выход пользователя из системы на всех устройствах.
   * Требует предварительной авторизации пользователя
   * (токен должен быть установлен в заголовках сессии)
   * @param {Parameters<APIRequestContext['delete']>[1]} options - Параметры DELETE запроса
   * @returns {Promise<APIResponse>} Ответ сервера
   */
  async deleteV1AccountLoginAll(
    options?: Parameters<APIRequestContext['delete']>[1],
  ): Promise<APIResponse> {
    return step('Выход пользователя из системы на всех устройствах', async () => {
      return this.delete('/v1/account/login/all', { ...options });
    });
  }
}
