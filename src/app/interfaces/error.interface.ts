export interface IErrorSources {
  path: string;
  message: string;
}

export interface IErrorResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  errorSources: IErrorSources[];
  error?: unknown;
}
