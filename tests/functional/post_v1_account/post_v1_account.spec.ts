import { checkStatusCodeHttp } from '../../../checkers/http_checkers';
import { test } from '../../../fixture/playwrightFixture';
import { faker } from '@faker-js/faker';

test('post_v1_account', async ({ accountHelper, prepareUser }) => {
  await accountHelper.registerNewUser(
    prepareUser.login,
    prepareUser.password,
    prepareUser.email,
    true,
  );
  await accountHelper.userLogin(prepareUser.login, prepareUser.password, true, true);
});

const now = new Date();
const data = now
  .toLocaleString('ru-RU', { hour12: false })
  .replace(/[-:T]/g, '_')
  .replace(' ', '_');

const testCase: { login: string; password: string; email: string }[] = [
  {
    login: `${faker.person.firstName()}${faker.person.lastName()}_${data}`,
    password: faker.internet.password({ length: 5 }),
    email: faker.internet.email(),
  },
  {
    login: `${faker.person.firstName()}${faker.person.lastName()}_${data}`,
    password: faker.internet.password({ length: 10 }),
    email: faker.internet.email().replace('@', ''),
  },
  {
    login: faker.person.lastName()[0],
    password: faker.internet.password({ length: 10 }),
    email: faker.internet.email(),
  },
];

testCase.forEach(({ login, password, email }, index) => {
  test(`test_post_v1_account_invalid_credentials case: ${index}`, async ({ accountHelper }) => {
    await checkStatusCodeHttp(
      async () => accountHelper.registerNewUser(login, password, email, false),
      {
        expectedStatusCode: 400,
        expectedMessage: 'Validation failed',
      },
    );
  });
});
