export type IHandler = (
  req: Request,
  server: Server,
  params?: Record<string, any>
) => Promise<Response>;

export interface IMiddlewareResponse {
  ok: boolean;
  status: number;
  statusText: string;
  data: any;
}

export type IMiddleware = (
  req: Request,
  server: Server
) => Promise<IMiddlewareResponse>;

export interface AddMethodProps {
  method?: Request["method"];
  path?: string;
  handler: IHandler;
}
