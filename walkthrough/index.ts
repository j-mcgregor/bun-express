import type { Server } from "bun";
import { pathToRegexp, match } from "path-to-regexp";

// bump
export type IHandler = (
  req: Request,
  server: Server,
  params?: Record<string, any>
) => Promise<Response>;

export interface AddMethodProps {
  method?: Request["method"];
  path?: string;
  handler: IHandler;
}

export interface IApp {
  routes: Map<Request["method"], Map<string, IHandler>>;
  port: number;
  hostname: string;
  prefix?: string;
  server?: Server;
}

export class App implements IApp {
  // Nested Map to hold all of the routes. Easy to get, set and iterate over.
  routes: Map<Request["method"], Map<string, IHandler>> = new Map();
  // Default port and hostname
  port = 8080;
  hostname = "localhost";
  // Optional prefix for all routes
  prefix: string;
  server?: Server;

  // Constructor to set the port, hostname and prefix, but they're optional
  constructor({
    port = Number(process.env["PORT"]) || 8080,
    hostname = process.env["HOSTNAME"] || "localhost",
    prefix = "",
  }: {
    port?: number;
    hostname?: string;
    prefix?: string;
  } = {}) {
    // Initialize all the HTTP methods
    this.routes.set("GET", new Map());
    this.routes.set("POST", new Map());
    this.routes.set("PUT", new Map());
    this.routes.set("PATCH", new Map());
    this.routes.set("DELETE", new Map());

    // Set the prefix, port and hostname
    this.prefix = prefix;
    this.port = port;
    this.hostname = hostname;
  }

  serve() {
    this.server = Bun.serve({
      port: this.port,
      hostname: this.hostname,
      development: true, // Enable development mode for better error messages & debugging
      fetch: async (request, server) => {
        // Get the URL from the request
        const url = new URL(request.url);
        // Get the routes for the method
        const methodRoutes = this.routes.get(request.method);

        // If no routes, return a 404
        if (!methodRoutes) {
          return Response.json(
            { message: "Method routes not found" },
            { status: 404 }
          );
        }

        // Iterate over all the routes for the method
        for await (const [path, _handler] of methodRoutes) {
          // Create a regex from the path
          const regex = pathToRegexp(path);
          // Match the regex with the pathname
          const matched = regex.exec(url.pathname);
          // use match to get params
          const matcher = match(path, { decode: decodeURIComponent });
          // get params
          const params = (matcher(url.pathname) as Record<string, any>)?.[
            "params"
          ];

          // If matched, call the handler
          if (matched) {
            try {
              const res = await _handler(request, server, params);

              return res;
            } catch (error) {
              // If the error is a Response, return it
              if (error instanceof Response) {
                return error;
              }

              // Otherwise, return a 500 error
              return Response.json({ message: String(error) }, { status: 500 });
            }
          } else {
            // If no match, continue to the next route
            continue;
          }
        }

        // If no route was found, return a 404
        return Response.json({ message: "Route not found" }, { status: 404 });
      },
    });

    // Log the hostname and port
    console.log(`Listening on ${this.server.hostname}:${this.server.port}`);
  }

  /**
   * Close the server
   * -- necessary for testing, otherwise the connection doesn't close fully between each test
   */
  close() {
    this.server?.stop(true); // the 'true' param is crucial here
  }

  /**
   * Print all routes
   */
  printRoutes() {
    this.routes.forEach((routes, method) => {
      console.log(`${method}`);
      routes.forEach((handler, route) => {
        console.log(`-- ${route}`);
      });
    });
  }

  /**
   * Add Method to the routes Map
   * @param {AddMethodProps} props - The {method, path, handler} for the route
   */

  addMethod(props: AddMethodProps) {
    const { method, path, handler } = props;

    // if no method or path, return
    if (!method || !path) {
      return;
    }

    // get the method from the routes
    const METHOD = this.routes.get(method);

    // if no METHOD, return
    if (!METHOD) {
      return;
    }

    // set the path and handler, including the prefix if it exists
    if (this.prefix) {
      METHOD.set(`${this.prefix}${path}`, handler);
    } else {
      METHOD.set(path, handler);
    }

    // set the METHOD routes
    this.routes.set(method, METHOD);
  }

  /**
   * Add a GET route
   * @param {string} path - The path of the route
   * @param {IHandler} handler - The handler for the route
   */
  get(path: AddMethodProps["path"], handler: IHandler) {
    this.addMethod({ method: "GET", path, handler });
  }

  /**
   * Add a POST route
   * @param {string} path - The path of the route
   * @param {IHandler} handler - The handler for the route
   */
  post(path: AddMethodProps["path"], handler: IHandler) {
    this.addMethod({ method: "POST", path, handler });
  }

  /**
   * Add a PUT route
   * @param {string} path - The path of the route
   * @param {IHandler} handler - The handler for the route
   */

  put(path: AddMethodProps["path"], handler: IHandler) {
    this.addMethod({ method: "PUT", path, handler });
  }

  /**
   * Add a PATCH route
   * @param {string} path - The path of the route
   * @param {IHandler} handler - The handler for the route
   */
  patch(path: AddMethodProps["path"], handler: IHandler) {
    this.addMethod({ method: "PATCH", path, handler });
  }

  /**
   * Add a DELETE route
   * @param {string} path - The path of the route
   * @param {IHandler} handler - The handler for the route
   */
  delete(path: AddMethodProps["path"], handler: IHandler) {
    this.addMethod({ method: "DELETE", path, handler });
  }
}
