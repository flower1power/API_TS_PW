import { randomUUID } from 'crypto';
import { APIRequestContext, request } from 'playwright';
import { Configuration } from './configuration.js';
import { attachment, ContentType } from 'allure-js-commons';
import { ApiResponse } from './api_response.js';

export { ApiResponse } from './api_response.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Базовый HTTP клиент для работы с REST API.
 *
 * Предоставляет методы для выполнения HTTP запросов (GET, POST, PUT, DELETE)
 * с автоматическим логированием, генерацией cURL команд и обработкой ответов.
 * Поддерживает настройку заголовков, базового URL и отключение логирования.
 */
export class RestClient {
  private context?: APIRequestContext;
  private readonly host: string;
  private headers: Record<string, string> = {};
  private readonly disableLog: boolean;

  /**
   * Безопасное добавление вложения в Allure. Игнорирует ошибки контекста теста.
   */
  private async _safeAttachment(name: string, content: string, type: ContentType): Promise<void> {
    try {
      await attachment(name, content, type);
    } catch (err) {
      // Вложение доступно только в контексте выполняющегося теста. Вне теста — пропускаем.
    }
  }

  constructor(configuration: Configuration) {
    this.host = configuration.host;
    this.headers = configuration.headers ?? {};
    this.disableLog = configuration.disableLog;
  }

  setHeaders(headers: Record<string, string>): void {
    this.headers = headers;
  }
  /**
   * Инициализация контекста запроса Playwright.
   * Создает новый контекст с базовым URL и заголовками.
   */
  async init(): Promise<void> {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: this.host,
        extraHTTPHeaders: this.headers,
      });
    }
  }

  /**
   * Освобождение ресурсов контекста запроса.
   */
  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = undefined;
    }
  }

  /**
   * Выполнение GET запроса.
   *
   * @param path - Путь к эндпоинту API
   * @param options - Дополнительные параметры для HTTP запроса (params, headers, timeout и т.д.)
   * @returns HTTP ответ от сервера
   */
  async get<T = unknown>(
    path: string,
    options?: Parameters<APIRequestContext['get']>[1],
  ): Promise<ApiResponse<T>> {
    return this._sendRequest<T>('GET', path, options);
  }

  /**
   * Выполнение POST запроса.
   *
   * @param path - Путь к эндпоинту API
   * @param options - Дополнительные параметры для HTTP запроса (json, data, headers, timeout и т.д.)
   * @returns HTTP ответ от сервера
   */
  async post<T = unknown>(
    path: string,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<ApiResponse<T>> {
    return this._sendRequest<T>('POST', path, options);
  }

  /**
   * Выполнение PUT запроса.
   *
   * @param path - Путь к эндпоинту API
   * @param options - Дополнительные параметры для HTTP запроса (json, data, headers, timeout и т.д.)
   * @returns HTTP ответ от сервера
   */
  async put<T = unknown>(
    path: string,
    options?: Parameters<APIRequestContext['put']>[1],
  ): Promise<ApiResponse<T>> {
    return this._sendRequest<T>('PUT', path, options);
  }

  /**
   * Выполнение DELETE запроса.
   *
   * @param path - Путь к эндпоинту API
   * @param options - Дополнительные параметры для HTTP запроса (headers, timeout и т.д.)
   * @returns HTTP ответ от сервера
   */
  async delete<T = unknown>(
    path: string,
    options?: Parameters<APIRequestContext['delete']>[1],
  ): Promise<ApiResponse<T>> {
    return this._sendRequest<T>('DELETE', path, options);
  }

  /**
   * Внутренний метод для выполнения HTTP запросов.
   *
   * Выполняет запрос, логирует детали запроса и ответа,
   * генерирует cURL команду для отладки.
   *
   * @param method - HTTP метод (GET, POST, PUT, DELETE)
   * @param path - Путь к эндпоинту API
   * @param options - Параметры для HTTP запроса
   * @returns HTTP ответ от сервера
   */
  private async _sendRequest<T = unknown>(
    method: HttpMethod,
    path: string,
    options: Record<string, any> = {},
  ): Promise<ApiResponse<T>> {
    const eventId = randomUUID();
    const fullUrl = this._buildFullUrl(path);

    await this.init();

    if (!this.context) {
      throw new Error('Не удалось инициализировать контекст запроса');
    }

    const requestOptions: Record<string, any> = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    };

    const reqBody: unknown = options.data || options.json;

    // Генерация cURL команды
    const curl = this._toCurl(
      method,
      fullUrl,
      requestOptions.headers,
      requestOptions.data || requestOptions.json,
    );

    if (this.disableLog) {
      console.log(curl);
      await this._safeAttachment('Curl', curl, ContentType.TEXT);

      const response = await this.context.fetch(path, { method, ...requestOptions });

      let responseBody: any;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = {};
      }

      // if (!apiResponse.ok()) {
      //   const error: any = new Error(`API Error: ${apiResponse.status} ${apiResponse.statusText}`);
      //   error.response = apiResponse;
      //   throw error;
      // }

      return new ApiResponse<T>(
        response.status(),
        response.statusText(),
        response.headers(),
        response.url(),
        responseBody as T,
        reqBody,
        curl,
      );
    }

    // Логирование запроса
    await this._logRequest(eventId, method, fullUrl, requestOptions);

    console.log(curl);
    await this._safeAttachment('Curl', curl, ContentType.TEXT);

    const response = await this.context.fetch(path, { method, ...requestOptions });

    let responseBody: any;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = {};
    }

    const apiResponse = new ApiResponse<T>(
      response.status(),
      response.statusText(),
      response.headers(),
      response.url(),
      responseBody as T,
      reqBody,
      curl,
    );

    // Логирование ответа
    await this._logResponse(eventId, apiResponse);

    return apiResponse;
  }

  /**
   * Построение полного URL для запроса.
   *
   * @param path - Путь к эндпоинту
   * @returns Полный URL
   */
  private _buildFullUrl(path: string): string {
    let cleanPath: string;
    if (path) {
      cleanPath = path.startsWith('/') ? path : `/${path}`;
      return this.host + cleanPath;
    }

    return this.host;
  }

  /**
   * Логирование деталей HTTP запроса.
   *
   * @param eventId - Уникальный идентификатор события
   * @param method - HTTP метод
   * @param fullUrl - Полный URL запроса
   * @param options - Параметры запроса
   */
  private async _logRequest(
    eventId: string,
    method: HttpMethod,
    fullUrl: string,
    options: Record<string, any>,
  ): Promise<void> {
    const textLog = JSON.stringify(
      {
        event: 'Request',
        eventId,
        method,
        fullUrl,
        params: options.params,
        headers: options.headers,
        json: options.data || options.json,
        data: options.data || options.json,
      },
      null,
      4,
    );

    console.log(textLog);

    await this._safeAttachment('Request', textLog, ContentType.JSON);
  }

  /**
   * Логирование деталей HTTP ответа.
   *
   * @param eventId - Уникальный идентификатор события
   * @param response - HTTP ответ
   */
  private async _logResponse(eventId: string, response: ApiResponse): Promise<void> {
    const textLog = JSON.stringify(
      {
        event: 'Response',
        eventId,
        status_code: response.status,
        headers: response.headers,
        json: response.body,
      },
      null,
      4,
    );

    console.log(textLog);

    await this._safeAttachment('Response', textLog, ContentType.JSON);
  }

  /**
   * Генерация cURL команды для отладки.
   *
   * @param method - HTTP метод
   * @param url - URL запроса
   * @param headers - Заголовки запроса
   * @param data - Данные запроса
   * @returns cURL команда в виде строки
   */
  private _toCurl(
    method: string,
    url: string,
    headers: Record<string, string> = {},
    data?: any,
  ): string {
    let curl = `curl -X ${method} '${url}'`;

    for (const key in headers) {
      curl += ` -H '${key}: ${headers[key]}'`;
    }

    if (data) {
      curl += ` -d '${JSON.stringify(data)}'`;
    }

    return curl;
  }
}
