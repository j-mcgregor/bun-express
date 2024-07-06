// Generated by dts-bundle-generator v9.5.1

import { Server } from 'bun';

export type IHandler = (req: Request, server: Server) => Promise<Response>;
export interface IMiddlewareResponse {
	ok: boolean;
	status: number;
	statusText: string;
	data: any;
}
export type IMiddleware = (req: Request, server: Server) => Promise<IMiddlewareResponse>;
export interface AddMethodProps {
	method?: Request["method"];
	path?: string;
	handler: IHandler;
}
export declare class App {
	routes: Map<Request["method"], Map<string, IHandler>>;
	port: number;
	hostname: string;
	ws?: Server;
	server?: Server;
	middleware: Map<string, IMiddleware>;
	prefix: string;
	constructor({ port, hostname, prefix, }?: {
		port?: number;
		hostname?: string;
		prefix?: string;
	});
	serve(): void;
	socket({ port }?: {
		port?: number | undefined;
	}): void;
	close(): void;
	get(path: AddMethodProps["path"], handler: IHandler): void;
	post(path: AddMethodProps["path"], handler: IHandler): void;
	put(path: AddMethodProps["path"], handler: IHandler): void;
	patch(path: AddMethodProps["path"], handler: IHandler): void;
	delete(path: AddMethodProps["path"], handler: IHandler): void;
	addMethod(props: AddMethodProps): void;
	use(props: AddMethodProps): void;
	setMiddleware(middleware: IMiddleware[]): void;
	printRoutes(): void;
}

export {};
