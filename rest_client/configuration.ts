export class Configuration {
  constructor(
    public host: string,
    public disableLog = false,
    public headers: Record<string, any> = {},
  ) {}
}
