import { test as base } from '@playwright/test';
import { ApiMailhog } from '../service/api_mailhog';
import { ApiDmAccount } from '../service/api_dm_account';
import { AccountHelpers } from '../helpers/account_helpers';
import { Configuration } from '../rest_client/configuration';
import { faker } from '@faker-js/faker';
export { expect } from '@playwright/test';

type MyFixtureType = {
  mailhogClient: ApiMailhog;
  accountClient: ApiDmAccount;
  accountHelper: AccountHelpers;
  authAccountHelper: AccountHelpers;
  prepareUser: { login: string; password: string; email: string };
};

export const test = base.extend<MyFixtureType>({
  // eslint-disable-next-line no-empty-pattern
  mailhogClient: async ({}, use) => {
    const config = new Configuration('http://5.63.153.31:5025', true);
    const client = new ApiMailhog(config);

    use(client);
  },

  // eslint-disable-next-line no-empty-pattern
  accountClient: async ({}, use) => {
    const config = new Configuration('http://5.63.153.31:5051');
    const client = new ApiDmAccount(config);

    use(client);
  },

  accountHelper: async ({ accountClient, mailhogClient }, use) => {
    const client = new AccountHelpers(accountClient, mailhogClient);

    use(client);
  },

  authAccountHelper: async ({ mailhogClient }, use) => {
    const config = new Configuration('http://5.63.153.31:5051');
    const accountClient = new ApiDmAccount(config);
    const accountHelper = new AccountHelpers(accountClient, mailhogClient);

    const login = 'DarrenDalton12_08_2025_22_43_04';
    const email = 'DarrenDalton12_08_2025_22_43_04@mail.ru';
    const password = 'C^Uy3BbI8h';

    await accountHelper.authUser(login, password);

    use(accountHelper);
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
