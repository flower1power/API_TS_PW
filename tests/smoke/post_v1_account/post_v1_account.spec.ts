import { parameter, subSuite, test } from '../../../fixture/playwrightFixture.js';
import { checkStatusCodeHttp } from '../../../checkers/http_checkers.js';
import { faker } from '@faker-js/faker';

const now = new Date();
const data = now
  .toLocaleString('ru-RU', { hour12: false })
  .replace(/[-:T]/g, '_')
  .replace(' ', '_');

const negativeTestCase: { login: string; password: string; email: string }[] = [
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

test.describe('Тесты на проверку метода POST v1/account', () => {
  test('Проверка регистрации нового пользователя', async ({ accountHelper, prepareUser }) => {
    await subSuite('Позитивные тесты');

    await accountHelper.registerNewUser(
      prepareUser.login,
      prepareUser.password,
      prepareUser.email,
      true,
    );
    await accountHelper.userLogin(prepareUser.login, prepareUser.password, true, true);
  });

  negativeTestCase.forEach(({ login, password, email }, index) => {
    test(`Проверка регистрации нового пользователя с невалидными кредами case: ${index}`, async ({
      accountHelper,
    }) => {
      await subSuite('Негативные тесты');
      await parameter('login', login);
      await parameter('password', password);
      await parameter('email', email);

      await checkStatusCodeHttp(
        async () => accountHelper.registerNewUser(login, password, email, false),
        {
          expectedStatusCode: 400,
          expectedMessage: 'Validation failed',
        },
      );
    });
  });
});
