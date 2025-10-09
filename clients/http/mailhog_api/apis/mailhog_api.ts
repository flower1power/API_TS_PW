import { APIRequestContext, APIResponse } from 'playwright';
import { RestClient } from '../../../../packages/rest_client/client';
import { step } from '../../../../fixture/playwrightFixture';

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
   * @returns {Promise<APIResponse | UserEnvelopeDTO>} Ответ сервера или DTO
   */
  async getApiV2Message(
    limit = 50,
    options?: Parameters<APIRequestContext['get']>[1],
  ): Promise<APIResponse> {
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
