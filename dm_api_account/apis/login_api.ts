import { APIRequestContext, APIResponse, request } from 'playwright';

export interface UserLoginData {
  login: string;
  password: string;
  rememberMe: boolean;
}

export class LoginApi {
  host: string;
  headers: string | null;

  constructor(host: string, headers: string | null = null) {
    this.host = host;
    this.headers = headers;
  }

  async postV1AccountLogin(jsonData: UserLoginData): Promise<APIResponse> {
    const context = await request.newContext();
    return context.post(`${this.host}/v1/account/login`, { data: jsonData });
  }
}
