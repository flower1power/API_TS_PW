import { APIResponse } from 'playwright/test';

export async function getActivationTokenByLogin(
  login: string,
  response: APIResponse,
): Promise<string | undefined> {
  const responseJson = await response.json();

  for (const item of responseJson.items) {
    const userData = JSON.parse(item.Content.Body);
    const userLogin = userData.Login;

    if (userLogin === login) {
      const token = userData.ConfirmationLinkUrl.split('/').at(-1);
      return token;
    }
  }
}
