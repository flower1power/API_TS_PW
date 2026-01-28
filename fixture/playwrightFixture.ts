import { test as base, expect as baseExpect, APIResponse } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { ApiMailhog } from '../service/api_mailhog.js';
import { ApiDmAccount } from '../service/api_dm_account.js';
import { AccountHelpers } from '../helpers/account_helpers.js';
import { Configuration } from '../packages/rest_client/configuration.js';
import { faker } from '@faker-js/faker';
import { z } from 'zod';

type MyFixtureType = {
  mailhogClient: ApiMailhog;
  accountClient: ApiDmAccount;
  accountHelper: AccountHelpers;
  authAccountHelper: AccountHelpers;
  prepareUser: { login: string; password: string; email: string };
  allure: typeof allure;
};

export const test = base.extend<MyFixtureType>({
  // eslint-disable-next-line no-empty-pattern
  mailhogClient: async ({}, use) => {
    const config = new Configuration('http://185.185.143.231:5025', true);
    const client = new ApiMailhog(config);

    await use(client);
  },

  // eslint-disable-next-line no-empty-pattern
  allure: async ({}, use) => {
    await use(allure);
  },

  // eslint-disable-next-line no-empty-pattern
  accountClient: async ({}, use) => {
    const config = new Configuration('http://185.185.143.231:5051');
    const client = new ApiDmAccount(config);

    await use(client);
  },

  accountHelper: async ({ accountClient, mailhogClient }, use) => {
    const client = new AccountHelpers(accountClient, mailhogClient);

    await use(client);
  },

  authAccountHelper: async ({ mailhogClient }, use) => {
    const config = new Configuration('http://5.63.153.31:5051');
    const accountClient = new ApiDmAccount(config);
    const accountHelper = new AccountHelpers(accountClient, mailhogClient);

    const login = 'DarrenDalton12_08_2025_22_43_04';
    // const email = 'DarrenDalton12_08_2025_22_43_04@mail.ru';
    const password = 'C^Uy3BbI8h';

    await accountHelper.authUser(login, password);

    await use(accountHelper);
  },

  // eslint-disable-next-line no-empty-pattern
  prepareUser: async ({}, use) => {
    const now = new Date();
    const data = now
      .toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/[^\d]/g, '_');

    const login = faker.internet.username().replace(' ', '') + data;
    const password = faker.internet.password({ length: 10, memorable: true });
    const email = faker.internet.email({ firstName: login });
    const user = { login: login, password: password, email: email };

    use(user);
  },
});

export const expect = baseExpect.extend({
  async toHaveStatusCode(response: APIResponse, expectedStatus: number) {
    const statusCode = response.status();
    const pass = statusCode === expectedStatus;

    let responseBody = '';

    try {
      responseBody = JSON.stringify(await response.json());
    } catch {
      responseBody = 'Тело отсутствует';
    }

    const errorMessage = `
Ожидаемый статус-код: ${expectedStatus}
Полученный статус-код: ${statusCode}
URL: ${response.url()}
Тело ответа: ${responseBody}
`;

    if (!pass) {
      return {
        message: (): string => errorMessage,
        pass: false,
      };
    }

    return {
      message: (): string => `Ответ вернул ожидаемый статус-код: ${statusCode}`,
      pass: true,
    };
  },

  async toMatchSchema(response: APIResponse, schema: z.ZodSchema) {
    const body = await response.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errorMessage = `
Ожидалось соответствие схеме:
Ошибки валидации: ${JSON.stringify(result.error.issues, null, 2)}
`;

      return {
        message: (): string => errorMessage,
        pass: false,
      };
    }

    return {
      message: (): string => `Данные соответствуют схеме`,
      pass: true,
    };
  },

  async toHaveHeader(response: APIResponse, headerName: string, expectedValue?: string) {
    const headers = response.headers();
    const actualValue = headers[headerName.toLowerCase()];
    const hasHeader = actualValue !== undefined;

    if (expectedValue === undefined) {
      const errorMessage = `
Ожидалось наличие заголовка: ${headerName}
Полученные заголовки: ${JSON.stringify(headers, null, 2)}
`;

      if (!hasHeader) {
        return {
          message: (): string => errorMessage,
          pass: false,
        };
      }

      return {
        message: (): string => `Заголовок "${headerName}" присутствует`,
        pass: true,
      };
    }

    const pass = hasHeader && actualValue === expectedValue;

    const errorMessage = `
Ожидаемое значение заголовка "${headerName}": ${expectedValue}
Полученное значение: ${actualValue || 'отсутствует'}
`;

    if (!pass) {
      return {
        message: (): string => errorMessage,
        pass: false,
      };
    }

    return {
      message: (): string => `Заголовок "${headerName}" имеет значение "${expectedValue}"`,
      pass: true,
    };
  },
});

export * from 'allure-js-commons';
