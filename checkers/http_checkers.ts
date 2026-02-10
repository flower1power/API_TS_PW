import { ApiResponse } from '../packages/rest_client/api_response.js';
import { step } from 'allure-js-commons';

type CheckStatusOptions = {
  expectedStatusCode?: number;
  expectedMessage?: string;
};

/**
 * Проверяет статус и сообщение в ответе HTTP
 */
export async function checkStatusCodeHttp<T>(
  fn: () => Promise<ApiResponse>,
  { expectedStatusCode = 200, expectedMessage }: CheckStatusOptions = {},
): Promise<void> {
  await step('Проверка ответа http', async () => {
    const result = await fn();
    const status = result.status;

    if (status !== expectedStatusCode) {
      throw new Error(`Ожидаемый статус-код ${expectedStatusCode}, получен ${status}`);
    }

    if (expectedMessage) {
      const body = result.body as any;
      if (body?.title !== expectedMessage) {
        throw new Error(`Ожидаемое сообщение "${expectedMessage}", получено "${body?.title}"`);
      }
    }
  });
}

export function isApiResponse(value: unknown): value is ApiResponse {
  return value instanceof ApiResponse;
}
