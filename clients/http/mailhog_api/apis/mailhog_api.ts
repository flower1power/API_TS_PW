import { APIRequestContext } from 'playwright';
import { RestClient, ApiResponse } from '../../../../packages/rest_client/client.js';
import { step } from 'allure-js-commons';

/**
 * API клиент для работы с Mailhog - почтовым сервисом для тестирования.
 * Предоставляет методы для получения писем из почтового ящика,
 * что полезно для тестирования функциональности регистрации
 * и получения токенов активации.
 */
export class MailhogApi extends RestClient {
  /**
   * Получение писем из почтового ящика Mailhog.
   * @param {number} limit - лимит
   * @param {Parameters<APIRequestContext['get']>[1]} options - Параметры GET запроса
   * @returns {Promise<ApiResponse>} Ответ сервера
   */
  async getApiV2Message(
    limit: number = 50,
    options?: Parameters<APIRequestContext['get']>[1],
  ): Promise<ApiResponse> {
    return step('Получение писем из почтового ящика Mailhog', async () => {
      const params = {
        limit: limit,
      };

      return this.get(`/api/v2/messages`, {
        params: params,
        ignoreHTTPSErrors: true,
        headers: { ...options?.headers },
        ...options,
      });
    });
  }
}
