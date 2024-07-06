import { describe, expect, it, beforeEach, afterEach } from "bun:test";

import { App, type IMiddlewareResponse } from "../app";

import type { Server } from "bun";

const PORT = 4000;

const url = `http://localhost:${PORT}/api/test`;

const options = {
  port: PORT,
  hostname: "localhost",
};

let app: App;

describe("App - middleware", () => {
  beforeEach(() => {
    app = new App(options);
  });

  afterEach(() => {
    app.close();
  });

  // works by itself
  it("should add middleware", async () => {
    app = new App(options);

    let called = false;

    async function middleware1(
      request: Request,
      server: Server
    ): Promise<IMiddlewareResponse> {
      called = true;
      return {
        ok: true,
        data: { message: "Response from GET /api/middleware/get-1" },
        status: 200,
        statusText: "OK",
      };
    }

    app.setMiddleware([middleware1]);

    app.serve();

    expect(app.middleware.get("middleware1")).toBeDefined();

    try {
      await fetch(url);

      expect(called).toBeTrue();
    } catch (error) {
      console.error("error :>> ", error);
      throw error;
    } finally {
      app.close();
    }
  });

  // works by itself
  it("should add middleware and then hit the route", async () => {
    app = new App(options);

    let called = false;

    async function middleware1(
      request: Request,
      server: Server
    ): Promise<IMiddlewareResponse> {
      called = true;
      return {
        ok: true,
        data: { message: "Response from GET /api/middleware/get-1" },
        status: 200,
        statusText: "OK",
      };
    }

    const mockFn = async (request: Request, server: Server) => {
      return Response.json({ message: "Response from GET /" });
    };

    app.setMiddleware([middleware1]);
    app.get("/api/test", mockFn);

    app.serve();

    expect(app.middleware.get("middleware1")).toBeDefined();

    try {
      const res = await fetch(url);
      const json = await res.json();

      expect(called).toBeTrue();
      expect(json.message).toBe("Response from GET /");
    } catch (error) {
      console.error("error :>> ", error);
      throw error;
    } finally {
      app.close();
    }
  });

  // works by itself
  it("should add multiple middleware and then hit the route", async () => {
    app = new App(options);

    let called1 = false;
    let called2 = false;

    const response = {
      ok: true,
      data: { message: "Response from GET /api/middleware/get-1" },
      status: 200,
      statusText: "OK",
    };

    async function middleware1(
      request: Request,
      server: Server
    ): Promise<IMiddlewareResponse> {
      called1 = true;
      return response;
    }

    async function middleware2(
      request: Request,
      server: Server
    ): Promise<IMiddlewareResponse> {
      called2 = true;
      return response;
    }

    const mockFn = async (request: Request, server: Server) => {
      return Response.json({ message: "Response from GET /" });
    };

    app.setMiddleware([middleware1, middleware2]);
    app.get("/api/test", mockFn);

    app.serve();

    expect(app.middleware.get("middleware1")).toBeDefined();

    try {
      const res = await fetch(url);
      const json = await res.json();

      expect(called1).toBeTrue();
      expect(called2).toBeTrue();
      expect(json.message).toBe("Response from GET /");
    } catch (error) {
      console.error("error :>> ", error);
      throw error;
    } finally {
      app.close();
    }
  });

  // works by itself
  it("should reject if middleware fails", async () => {
    app = new App(options);

    let called = false;

    async function middleware1(
      request: Request,
      server: Server
    ): Promise<IMiddlewareResponse> {
      called = true;
      return {
        ok: false,
        data: { message: "Error" },
        status: 500,
        statusText: "Internal Server Error",
      };
    }

    const mockFn = async (request: Request, server: Server) => {
      return Response.json({ message: "Response from GET /" });
    };

    app.setMiddleware([middleware1]);
    app.get("/api/test", mockFn);

    app.serve();

    expect(app.middleware.get("middleware1")).toBeDefined();

    try {
      const res = await fetch(url);
      const json = await res.json();

      expect(called).toBeTrue();
      expect(json.message).toBe("Error");
      expect(res.status).toBe(500);
    } catch (error) {
      console.error("error :>> ", error);
      throw error;
    } finally {
      app.close();
    }
  });
});
