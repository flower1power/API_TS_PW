import { ApiDmAccount } from '../service/api_dm_account';
import { ApiMailhog } from '../service/api_mailhog';
import { UserCredentials } from '../dm_api_account/apis/account_api';
import { APIResponse, expect } from 'playwright/test';
import { UserLoginData } from '../dm_api_account/apis/login_api';

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
   * @returns HTTP ответ от сервера после активации пользователя
   */
  async registerNewUser(login: string, password: string, email: string): Promise<APIResponse> {
    const credentialsData: UserCredentials = {
      login: login,
      email: email,
      password: password,
    };

    let response = await this.apiDmAccount.accountApi.postV1Account(credentialsData);
    expect(response.status(), { message: 'Пользователь не был создан' }).toEqual(201);

    const token = await this.getActivationTokenByLogin(login);
    expect(token, { message: `Токен для пользователя ${login}, не был получен` }).not.toBeNull();

    response = await this.apiDmAccount.accountApi.putV1AccountToken(token!);
    expect(response.status(), { message: 'Пользователь не был активирован' }).toEqual(200);

    return response;
  }

  /**
   * Авторизация пользователя в системе.
   *
   * @param login - Логин пользователя
   * @param password - Пароль пользователя
   * @param rememberMe - Флаг "запомнить меня". По умолчанию true
   * @returns HTTP ответ от сервера с результатом авторизации
   */
  async userLogin(login: string, password: string, rememberMe = true): Promise<APIResponse> {
    const loginData: UserLoginData = {
      login: login,
      password: password,
      rememberMe: rememberMe,
    };

    const response = await this.apiDmAccount.loginApi.postV1AccountLogin(loginData);
    expect(response.status(), { message: 'Пользователь не смог авторизоваться' }).toEqual(200);

    return response;
  }

  /**
   * Авторизация клиента и установка токена аутентификации в заголовки.
   *
   * Выполняет вход в систему и устанавливает полученный токен
   * в заголовки для последующих запросов.
   *
   * @param login - Логин пользователя
   * @param password - Пароль пользователя
   */
  async authUser(login: string, password: string): Promise<void> {
    const response = await this.apiDmAccount.loginApi.postV1AccountLogin({
      login: login,
      password: password,
      rememberMe: true,
    });

    expect(response.status(), { message: 'Пользователь не смог авторизоваться' }).toEqual(200);

    const headers = response.headers();
    const token = {
      'x-dm-auth-token': headers['x-dm-auth-token'],
    };

    this.apiDmAccount.accountApi.setHeaders(token);
    this.apiDmAccount.loginApi.setHeaders(token);
    // Note: Headers are set at the RestClient level during initialization
    // The token will be used in subsequent requests via the options parameter
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
    const response = await this.apiMailhog.mailhogApi.getApiV2Message();
    expect(response.status(), { message: 'Письма не были получены' }).toEqual(200);

    const responseJson = await response.json();

    for (const item of responseJson.items) {
      const userData = JSON.parse(item.Content.Body);
      const userLogin = userData.Login;

      if (userLogin === login) {
        const token = userData.ConfirmationLinkUrl.split('/').at(-1);
        return token;
      }
    }

    return undefined;
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
    const response = await this.apiMailhog.mailhogApi.getApiV2Message();
    expect(response.status(), { message: 'Письма не были получены' }).toEqual(200);

    const responseJson = await response.json();

    for (const item of responseJson.items) {
      const userData = JSON.parse(item.Content.Body);
      const userLogin = userData.Login;

      if (userLogin === login) {
        // Используем только ConfirmationLinkUri для получения токена сброса пароля
        if ('ConfirmationLinkUri' in userData) {
          const token = userData.ConfirmationLinkUri.split('/').at(-1);
          return token;
        }
      }
    }

    return undefined;
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
   * @returns HTTP ответ от сервера с результатом смены пароля
   */
  async changePassword(
    login: string,
    email: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<APIResponse> {
    await this.apiDmAccount.accountApi.postV1AccountPassword(login, email);
    const resetToken = await this.getResetPasswordTokenByLogin(login);
    expect(resetToken, {
      message: `Токен для сброса пароля пользователя ${login} не был получен`,
    }).not.toBeNull();

    const response = await this.apiDmAccount.accountApi.putV1AccountChangePassword({
      login: login,
      token: resetToken!,
      oldPassword: oldPassword,
      newPassword: newPassword,
    });
    expect(response.status(), { message: 'Не удалось изменить пароль' }).toEqual(200);

    return response;
  }

  /**
   * Изменение email адреса пользователя.
   *
   * @param login - Логин пользователя
   * @param newEmail - Новый email адрес
   * @param password - Пароль пользователя
   * @returns HTTP ответ от сервера с результатом изменения email
   */
  async changeEmail(login: string, password: string, newEmail: string): Promise<APIResponse> {
    const response = await this.apiDmAccount.accountApi.putV1AccountChangeEmail({
      login: login,
      password: password,
      email: newEmail,
    });
    expect(response.status(), { message: 'Не удалось изменить почту' }).toEqual(200);

    return response;
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
    if (token) {
      options.headers = { ...options.headers, 'x-dm-auth-token': token };
    }

    const response = await this.apiDmAccount.loginApi.deleteV1AccountLogin(options);
    console.log(response);
    expect(response.status(), { message: 'Не удалось выйти из аккаунта' }).toEqual(204);

    return response;
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
    if (token) {
      options.headers = { ...options.headers, 'x-dm-auth-token': token };
    }

    const response = await this.apiDmAccount.loginApi.deleteV1AccountLoginAll();
    expect(response.status(), { message: 'Не удалось выйти из аккаунта' }).toEqual(204);

    return response;
  }

  /**
   * Активация зарегистрированного пользователя по токену.
   *
   * @param token - Токен активации, полученный при регистрации
   * @returns HTTP ответ от сервера с результатом активации
   */
  async activateUser(token: string): Promise<APIResponse> {
    const response = await this.apiDmAccount.accountApi.putV1AccountToken(token);
    expect(response.status(), { message: 'Пользователь не был активирован' }).toEqual(200);

    return response;
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
