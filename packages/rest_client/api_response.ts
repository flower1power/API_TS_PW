import { expect } from '../../fixture/playwrightFixture.js';
import { z } from 'zod';

export class ApiResponse<T = unknown> {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly headers: Record<string, string>,
    public readonly url: string,
    public readonly body: T,
    public readonly requestBody: unknown,
    public readonly curl: string,
  ) {}

  ok(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  private getMetaData(): ApiResponse {
    return {
      ...this,
    };
  }

  async toHaveStatusCode(expectedStatusCode: number): Promise<void> {
    await expect(this.status).toHaveStatusCodeAPI(
      this.url,
      this.body,
      this.requestBody,
      this.curl,
      expectedStatusCode,
    );
  }

  async toMatchSchema<U>(schema: z.ZodSchema<U>): Promise<U> {
    await expect(this.body as unknown).toMatchSchemaAPI(schema);
    return this.body as unknown as U;
  }

  async checkError(expectedStatusCode: number, expectedErrorMessage: string): Promise<void> {
    await this.toHaveStatusCode(expectedStatusCode);
    const body = this.body as unknown;
    await expect(body).checkErrorBody(this.getMetaData(), expectedErrorMessage);
  }

  async check<U>(expected: {
    statusCode?: number;
    schema?: z.ZodSchema<U>;
    errorMessage?: string;
  }): Promise<void> {
    await this.toHaveStatusCode(expected.statusCode ?? 200);

    if (expected.errorMessage) {
      const body = this.body as unknown;
      await expect(body).checkErrorBody(this.getMetaData(), expected.errorMessage);
    }

    if (expected.schema) {
      await this.toMatchSchema(expected.schema);
    }
  }
}
