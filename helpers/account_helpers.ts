import { ChangeEmailDTO } from '../clients/http/dm_api_account/models/changeEmail.js';
import { ChangePasswordDTO } from '../clients/http/dm_api_account/models/changePassword.js';
import { LoginCredentialsDTO } from '../clients/http/dm_api_account/models/loginCredentials.js';
import { RegistrationDTO } from '../clients/http/dm_api_account/models/registration.js';
import { ResetPasswordDTO } from '../clients/http/dm_api_account/models/resetPassword.js';
import { UserEnvelopeDTO } from '../clients/http/dm_api_account/models/userDetails.js';
import { step } from 'allure-js-commons';
import { ApiDmAccount } from '../service/api_dm_account.js';
import { ApiMailhog } from '../service/api_mailhog.js';
import { APIResponse, expect } from 'playwright/test';

/**
 * Вспомогательный класс для работы с аккаунтами пользователей.
 *
 * Предоставляет высокоуровневые методы для регистрации, авторизации
 * и управления пользователями через API.
 */
export class AccountHelpers {
  constructor(
    public apiDmAccount: ApiDmAccount,
    public apiMailhog: ApiMailhog,
  ) {}

  /**
   * Регистрация нового пользователя с последующей активацией.
   *
   * Создает нового пользователя, получает токен активации из почты
   * и активирует аккаунт.
   *
   * @param login - Логин пользователя
   * @param password - Пароль пользователя
   * @param email - Email адрес пользователя
   * @param validateResponse
   * @returns HTTP ответ от сервера после активации пользователя
   */
  async registerNewUser(
    login: string,
    password: string,
    email: string,
    validateResponse: false,
  ): Promise<APIResponse>;
  async registerNewUser(
    login: string,
    password: string,
    email: string,
    validateResponse: true,
  ): Promise<UserEnvelopeDTO>;
  async registerNewUser(
    login: string,
    password: string,
    email: string,
    validateResponse: boolean,
  ): Promise<APIResponse | UserEnvelopeDTO> {
    return step('Регистрация нового пользователя с последующей активацией', async () => {
      const credentialsData: RegistrationDTO = {
        login: login,
        email: email,
        password: password,
      };

      await this.apiDmAccount.accountApi.postV1Account(credentialsData);

      const token = await this.getActivationTokenByLogin(login);
      expect(token, `Токен для пользователя ${login} = ${token}`).not.toBeUndefined();

      const response = await this.apiDmAccount.accountApi.putV1AccountToken(
        token!,
        validateResponse,
      );

      if (!validateResponse) {
        expect((response as APIResponse).status(), {
          message: 'Пользователь не был активирован',
        }).toEqual(200);
      }

      return response;
    });
  }

  /**
   * Авторизация пользователя в системе.
   *
   * @param login - Логин пользователя
   * @param password - Пароль пользователя
   * @param rememberMe - Флаг "запомнить меня". По умолчанию true
   * @param validateResponse
   * @param validateHeader
   * @returns HTTP ответ от сервера с результатом авторизации
   */
  async userLogin(
    login: string,
    password: string,
    rememberMe?: boolean,
    validateResponse?: false,
    validateHeader?: boolean,
  ): Promise<APIResponse>;
  async userLogin(
    login: string,
    password: string,
    rememberMe?: boolean,
    validateResponse?: true,
    validateHeader?: boolean,
  ): Promise<UserEnvelopeDTO>;
  async userLogin(
    login: string,
    password: string,
    rememberMe = true,
    validateResponse = false,
    validateHeader = false,
  ): Promise<APIResponse | UserEnvelopeDTO> {
    return step('Авторизация пользователя в системе', async () => {
      const loginData: LoginCredentialsDTO = {
        login: login,
        password: password,
        rememberMe: rememberMe,
      };

      const response = await this.apiDmAccount.loginApi.postV1AccountLogin(
        loginData,
        validateResponse,
      );

      if (!validateResponse && validateHeader) {
        expect((response as APIResponse).headers()['x-dm-auth-token']).toBeTruthy();
      }

      return response;
    });
  }

  /**
   * Авторизация клиента и установка токена аутентификации в заголовки.
   *
   * Выполняет вход в систему и устанавливает полученный токен
   * в заголовки для последующих запросов.
   *
   * @param login - Логин пользователя
   * @param password - Пароль пользователя
   * @param rememberMe
   */
  async authUser(login: string, password: string, rememberMe = true): Promise<void> {
    return step('Авторизация клиента и установка токена аутентификации в заголовки', async () => {
      const response = await this.userLogin(login, password, rememberMe, false, false);

      const headers = response.headers();
      const token = {
        'x-dm-auth-token': headers['x-dm-auth-token'],
      };

      this.apiDmAccount.accountApi.setHeaders(token);
      this.apiDmAccount.loginApi.setHeaders(token);
    });
  }

  /**
   * Получение токена активации для пользователя по логину.
   *
   * Ищет письмо с токеном активации в почтовом ящике Mailhog
   * для указанного пользователя.
   *
   * @param login - Логин пользователя для поиска токена
   * @returns Токен активации пользователя
   */
  @retries(5)
  async getActivationTokenByLogin(login: string): Promise<string | undefined> {
    return step('Получение токена активации для пользователя по логину', async () => {
      const response = await this.apiMailhog.mailhogApi.getApiV2Message();
      expect(response.status(), `statusCode: ${response.status()}, ожидался: 200`).toEqual(200);

      const responseJson = await response.json();

      for (const item of responseJson.items) {
        const userData = JSON.parse(item.Content.Body);
        const userLogin = userData.Login;

        if (userLogin === login) {
          return userData.ConfirmationLinkUrl.split('/').at(-1);
        }
      }

      return undefined;
    });
  }

  /**
   * Получение токена сброса пароля для пользователя по логину.
   *
   * Ищет письмо с токеном сброса пароля в почтовом ящике Mailhog
   * для указанного пользователя. Токен используется для смены пароля
   * через API.
   *
   * @param login - Логин пользователя для поиска токена
   * @returns Токен сброса пароля пользователя
   */
  @retries(5)
  async getResetPasswordTokenByLogin(login: string): Promise<string | undefined> {
    return step('Получение токена сброса пароля для пользователя по логину', async () => {
      const response = await this.apiMailhog.mailhogApi.getApiV2Message();
      expect(response.status(), `statusCode: ${response.status()}, ожидался: 200`).toEqual(200);

      const responseJson = await response.json();

      for (const item of responseJson.items) {
        const userData = JSON.parse(item.Content.Body);
        const userLogin = userData.Login;

        if (userLogin === login) {
          if ('ConfirmationLinkUri' in userData) {
            return userData.ConfirmationLinkUri.split('/').at(-1);
          }
        }
      }

      return undefined;
    });
  }

  /**
   * Смена пароля пользователя с использованием токена сброса пароля.
   *
   * Процесс смены пароля включает:
   * 1. Запрос на сброс пароля через API
   * 2. Получение токена сброса пароля из письма
   * 3. Выполнение запроса на изменение пароля
   *
   * @param login - Логин пользователя
   * @param email - Email адрес пользователя
   * @param oldPassword - Текущий пароль пользователя
   * @param newPassword - Новый пароль пользователя
   * @param validateResponse
   * @returns HTTP ответ от сервера с результатом смены пароля
   */
  async changePassword(
    login: string,
    email: string,
    oldPassword: string,
    newPassword: string,
    validateResponse = true,
  ): Promise<APIResponse | UserEnvelopeDTO> {
    return step('Смена пароля пользователя с использованием токена сброса пароля', async () => {
      const loginData: ResetPasswordDTO = {
        login: login,
        email: email,
      };
      await this.apiDmAccount.accountApi.postV1AccountPassword(loginData, validateResponse);

      const resetToken = await this.getResetPasswordTokenByLogin(login);

      expect(resetToken, {
        message: `Токен для сброса пароля пользователя ${login} не был получен`,
      }).not.toBeUndefined();

      const changePasswordData: ChangePasswordDTO = {
        login: login,
        token: resetToken!,
        oldPassword: oldPassword,
        newPassword: newPassword,
      };

      let response = await this.apiDmAccount.accountApi.putV1AccountChangePassword(
        changePasswordData,
        validateResponse,
      );

      if (validateResponse) {
        response = response as UserEnvelopeDTO;

        return response;
      }

      response = response as APIResponse;
      expect(response.status(), { message: 'Не удалось изменить пароль' }).toEqual(200);

      return response;
    });
  }

  /**
   * Изменение email адреса пользователя.
   *
   * @param login - Логин пользователя
   * @param newEmail - Новый email адрес
   * @param password - Пароль пользователя
   * @param validateResponse
   * @returns HTTP ответ от сервера с результатом изменения email
   */
  async changeEmail(
    login: string,
    password: string,
    newEmail: string,
    validateResponse = true,
  ): Promise<APIResponse | UserEnvelopeDTO> {
    return step('Изменение email адреса пользователя', async () => {
      const changeEmailData: ChangeEmailDTO = {
        login: login,
        password: password,
        email: newEmail,
      };

      let response = await this.apiDmAccount.accountApi.putV1AccountChangeEmail(
        changeEmailData,
        validateResponse,
      );

      if (validateResponse) {
        response = response as UserEnvelopeDTO;

        return response;
      }

      response = response as APIResponse;
      expect(response.status(), { message: 'Не удалось изменить почту' }).toEqual(200);

      return response;
    });
  }

  /**
   * Выход пользователя из системы на текущем устройстве.
   *
   * По умолчанию использует текущие заголовки сессии клиента. Можно передать
   * конкретный `token`, чтобы разлогинить определённую сессию, отличную от
   * той, что установлена в сессии клиента.
   *
   * @param token - Опциональный токен `x-dm-auth-token` для разлогина конкретной сессии
   * @param options - Дополнительные параметры для HTTP запроса
   * @returns HTTP ответ от сервера с результатом выхода
   */
  async logoutUser(token?: string, options: Record<string, any> = {}): Promise<APIResponse> {
    return step('Выход пользователя из системы на текущем устройстве', async () => {
      if (token) {
        options.headers = { ...options.headers, 'x-dm-auth-token': token };
      }

      const response = await this.apiDmAccount.loginApi.deleteV1AccountLogin(options);
      console.log(response);
      expect(response.status(), `statusCode: ${response.status()}, ожидалось: 200`).toEqual(204);

      return response;
    });
  }

  /**
   * Выход пользователя из системы на всех устройствах.
   *
   * Удаляет все активные сессии пользователя, делая все токены
   * аутентификации недействительными на всех устройствах.
   * По умолчанию использует текущие заголовки сессии клиента. Можно передать
   * конкретный `token`.
   *
   * @param token - Опциональный токен `x-dm-auth-token` для разлогина конкретной сессии
   * @param options - Дополнительные параметры для HTTP запроса
   * @returns HTTP ответ от сервера с результатом выхода
   */
  async logoutUserAllDevice(
    token?: string,
    options: Record<string, any> = {},
  ): Promise<APIResponse> {
    return step('Выход пользователя из системы на всех устройствах', async () => {
      if (token) {
        options.headers = { ...options.headers, 'x-dm-auth-token': token };
      }

      const response = await this.apiDmAccount.loginApi.deleteV1AccountLoginAll();
      expect(response.status(), `statusCode: ${response.status()}, ожидалось: 200`).toEqual(204);

      return response;
    });
  }

  /**
   * Активация зарегистрированного пользователя по токену.
   *
   * @param token - Токен активации, полученный при регистрации
   * @param validateResponse
   * @returns HTTP ответ от сервера с результатом активации
   */
  async activateUser(
    token: string,
    validateResponse = true,
  ): Promise<APIResponse | UserEnvelopeDTO> {
    return step('Активация зарегистрированного пользователя по токену', async () => {
      let response = await this.apiDmAccount.accountApi.putV1AccountToken(token, validateResponse);

      if (validateResponse) {
        response = response as APIResponse;
        return response;
      }

      response = response as APIResponse;
      expect(response.status(), { message: 'Пользователь не был активирован' }).toEqual(200);

      return response;
    });
  }
}

/**
 * Декоратор для повторного выполнения функции до получения результата.
 *
 * Выполняет функцию до указанного количества раз с интервалом в 1 секунду,
 * пока не получит не-undefined результат или не превысит лимит попыток.
 *
 * @param num - Количество попыток выполнения
 * @param delayMs - Задержка между попытками в миллисекундах
 * @returns Декоратор функции
 */
function retries(num: number, delayMs = 1000) {
  return function <This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Promise<Return>,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>,
  ): void {
    const methodName = context.name;

    context.addInitializer(function (this: This) {
      const originalMethod = (this as any)[methodName];

      (this as any)[methodName] = async function (this: This, ...args: Args): Promise<Return> {
        for (let attempt = 1; attempt <= num; attempt++) {
          console.log(`Попытка ${attempt} из ${num}`);
          const result = await originalMethod.call(this, ...args);

          if (result !== undefined && result !== null) {
            return result;
          }

          if (attempt === num) {
            return result;
          }

          await new Promise((r) => setTimeout(r, delayMs));
        }

        return undefined as Return;
      };
    });
  };
}
