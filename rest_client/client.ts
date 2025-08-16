import { randomUUID } from 'crypto';
import { APIRequestContext, APIResponse, request } from 'playwright';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class RestClient {
  private context?: APIRequestContext;
  private readonly host: string;
  private readonly headers: Record<string, string>;

  constructor(host: string, headers = {}) {
    this.host = host;
    this.headers = headers;
  }

  async init() {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: this.host,
        extraHTTPHeaders: this.headers,
      });
    }
  }

  async dispose() {
    if (this.context) {
      await this.context.dispose();
      this.context = undefined;
    }
  }

  async get(path: string, options?: Parameters<APIRequestContext['get']>[1]) {
    return this._sendRequest('GET', path, options);
  }

  async post(path: string, options?: Parameters<APIRequestContext['post']>[1]) {
    return this._sendRequest('POST', path, options);
  }

  async put(path: string, options?: Parameters<APIRequestContext['put']>[1]) {
    return this._sendRequest('PUT', path, options);
  }

  async delete(path: string, options?: Parameters<APIRequestContext['delete']>[1]) {
    return this._sendRequest('DELETE', path, options);
  }

  private async _sendRequest(
    method: HttpMethod,
    path: string,
    options: Record<string, any> = {},
  ): Promise<APIResponse> {
    const eventId = randomUUID();
    const fullUrl = this.host + (path.startsWith('/') ? path : `/${path}`);

    console.log(
      JSON.stringify(
        {
          event: 'Request',
          eventId,
          method,
          fullUrl,
          params: options.params,
          headers: options.headers,
          json: options.data,
          data: options.data,
        },
        null,
        4,
      ),
    );

    console.log(this.toCurl(method, fullUrl, options.headers, options.data));
    await this.init();

    if (!this.context) {
      throw new Error('Не удалось инициализировать контекст запроса');
    }

    const response = await this.context.fetch(path, { method, ...options });

    let responseJson: any;
    try {
      responseJson = await response.json();
    } catch (e) {
      responseJson = {};
    }

    console.log(
      JSON.stringify(
        {
          event: 'Response',
          eventId,
          status_code: response.status(),
          headers: response.headers(),
          json: responseJson,
        },
        null,
        4,
      ),
    );

    return response;
  }

  private toCurl(
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
