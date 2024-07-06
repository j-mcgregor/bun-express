/// <reference types="bun-types" />
/// <reference types="bun-types" />
import type { Server } from "bun";
import type { IHandler, IMiddleware, AddMethodProps } from "../types";
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
        port?: number;
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
