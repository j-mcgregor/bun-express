import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  afterAll,
  beforeAll,
} from "bun:test";
import { $ } from "bun";

import { App } from "..";

import type { Server } from "bun";

const PORT = 4000;

const url = `http://localhost:${PORT}/api/test`;

const options = {
  port: PORT,
  hostname: "localhost",
};

describe("App - routes", () => {
  let app: App | null = null;

  // works by itself
  it("should add a route using get()", async () => {
    app = new App(options);

    let called = false;

    async function mockGetFn(request: Request, server: Server) {
      called = true;
      return Response.json({ message: "Response from GET /" });
    }

    app.get("/api/test", mockGetFn);

    app.serve();

    const GET = app.routes.get("GET");

    try {
      const res = await fetch(url);
      const json = await res.json();

      expect(called).toBeTrue();
      expect(json.message).toBe("Response from GET /");
      expect(GET).toBeDefined();
    } catch (error) {
      console.error("error :>> ", error);
      throw error;
    } finally {
      app.close();
    }
  });

  // works by itself
  it("should add a route using post()", async () => {
    app = new App(options);

    let called = false;

    async function mockFn(request: Request, server: Server) {
      called = true;
      return Response.json({ message: "Response from POST 1 /" });
    }

    app.post("/api/test", mockFn);

    const POST = app.routes.get("POST");

    app.serve();

    try {
      const res = await fetch(url, {
        method: "POST",
      });
      const json = await res.json();

      expect(called).toBeTrue();
      expect(json.message).toBe("Response from POST 1 /");
      expect(POST).toBeDefined();
    } catch (error) {
      console.error("error :>> ", error);
      throw error;
    } finally {
    }
    app.close();
  });

  // body parsing
  // works by itself
  it("should parse the body of a POST request", async () => {
    app = new App(options);

    async function mockPostFn(request: Request, server: Server) {
      const body = await request.json();

      return Response.json(body);
    }

    app.post("/api/test", mockPostFn);
    app.serve();

    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ message: "Hello, World!" }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      expect(json).toEqual({ message: "Hello, World!" });
    } catch (error) {
      console.error("error :>> ", error);
      throw error;
    } finally {
      app.close();
    }
  });
});
