import { test } from '../fixture/playwrightFixture';
import { faker } from '@faker-js/faker';
import { t } from '@faker-js/faker/dist/airline-CLphikKp';

test('test', async ({ request }) => {
  const jsonDataReg = {
    login: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  const baseURL = 'http://5.63.153.31:5051';
  let response = await request.post(`${baseURL}/v1/account`, {
    data: jsonDataReg,
  });

  console.log('RES1: ', response);

  const baseMailhogURL = 'http://5.63.153.31:5025';
  const params = {
    limit: '50',
  };

  response = await request.get(`${baseMailhogURL}/api/v2/messages`, {
    params: params,
  });

  console.log('RES2: ', await response.json());
});
