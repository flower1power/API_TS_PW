import { APIResponse } from 'playwright';
import z from 'zod';

type CheckStatusOptions = {
  expectedStatusCode?: number;
  expectedMessage?: string;
};

/**
 * Проверяет статус и сообщение в ответе HTTP
 */
export async function checkStatusCodeHttp<T>(
  fn: () => Promise<APIResponse>,
  { expectedStatusCode = 200, expectedMessage }: CheckStatusOptions = {},
): Promise<void> {
  try {
    const result = await fn();
    const status = result.status();

    if (status !== expectedStatusCode) {
      throw new Error(`Ожидаемый статус-код ${expectedStatusCode}, получен ${status}`);
    }

    if (expectedMessage) {
      const body = await result.json();
      if (body?.title !== expectedMessage) {
        throw new Error(`Ожидаемое сообщение "${expectedMessage}", получено "${body?.title}"`);
      }
    }
  } catch (err: any) {
    if (err?.response) {
      const status = err.response.status();
      const body = await err.response.json();
      const title = body?.title;

      if (status !== expectedStatusCode) {
        throw new Error(`Ожидаемый статус-код ${expectedStatusCode}, получен ${status}`);
      }

      if (expectedMessage && title !== expectedMessage) {
        throw new Error(`Ожидаемое сообщение "${expectedMessage}", получено "${title}"`);
      }
    } else {
      throw err;
    }
  }
}

export function isApiResponse(value: unknown): value is APIResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    typeof (value as APIResponse).status === 'function'
  );
}
