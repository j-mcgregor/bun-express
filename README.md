# bun-express

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

### Introductions

Express is a widely popular framework in the Node.js ecosystem. While it's possible to run Express with Bun, it still relies on the Node.js runtime. To gain a deeper understanding of both Express and Bun, we'll embark on the journey of building our own framework. This hands-on approach will provide valuable insights into the inner workings of Express-like frameworks.

In our implementation, we'll focus on building the following core features to understand Express better:

- Routing
- Middleware
- Request and Response objects
- JSON and form data parsing

To keep our project focused, we won't be diving into these aspects (at least for now):

- Static files
- Template rendering (with React)
- WebSockets
- Testing
- File uploads
- Cookies and sessions
- Error handling

While our end result may not be an exact replica of Express, it will serve as an excellent foundation for understanding how such frameworks operate under the hood. As an added bonus, our implementation will leverage Bun's capabilities, making it blazingly fast!

### Getting Started

- Install Bun and create a new project (instructions can be found [here](https://bun.sh/docs/installation)). We'll be using mac / linux for the examples, but the instructions are similar for other operating systems.

```bash
# Mac / Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"

# check version to make sure its installed
bun --version # 1.1.30
```

- Create a new project

```bash
mkdir -p bun-express/src && cd bun-express

bun init
```

- Install dependencies

```bash
# dependencies
bun add path-to-regexp

# dev dependencies
# @types/bun should be installed by default with bun init but install it if it isn't
bun add -D @types/bun
```

- Create the App class
- Like when using Express, we'll create the app class in `app.ts`, then initialize and run it in `server.ts`

```typescript
// src/app.ts
import type { Server } from "bun";

// Define the handler function type for route callbacks
export type IHandler = (
  req: Request,
  server: Server,
  params?: Record<string, any>
) => Promise<Response>;

// Interface defining the structure of our App class
export interface IApp {
  routes: Map<Request["method"], Map<string, IHandler>>; // Nested map for storing routes
  port: number;                                          // Port to run the server on
  hostname: string;                                      // Hostname for the server
  prefix?: string;                                       // Optional prefix for all routes
}

export class App implements IApp {
  // Nested Map to hold all of the routes. Outer map keys are HTTP methods, inner map keys are route paths.
  routes: Map<Request["method"], Map<string, IHandler>> = new Map();
  
  // Default port and hostname for the server
  port = 8080;
  hostname = "localhost";
  
  // Optional prefix for all routes (e.g., '/api')
  prefix: string;

  /**
   * Constructor to initialize the App instance
   * @param {Object} options - Configuration options
   * @param {number} [options.port=8080] - Port to run the server on
   * @param {string} [options.hostname="localhost"] - Hostname for the server
   * @param {string} [options.prefix=""] - Optional prefix for all routes
   */
  constructor({
    port = Number(process.env.PORT) || 8080,
    hostname = process.env.HOSTNAME || "localhost",
    prefix = "",
  }: {
    port?: number;
    hostname?: string;
    prefix?: string;
  } = {}) {
    // Initialize maps for main supported HTTP methods
    this.routes.set("GET", new Map());
    this.routes.set("POST", new Map());
    this.routes.set("PUT", new Map());
    this.routes.set("PATCH", new Map());
    this.routes.set("DELETE", new Map());

    // Set the instance properties
    this.prefix = prefix;
    this.port = port;
    this.hostname = hostname;
  }

  /**
   * Print all registered routes
   * This method is useful for debugging and seeing all available endpoints
   */
  printRoutes() {
    this.routes.forEach((routes, method) => {
      console.log(`${method}`);
      routes.forEach((handler, route) => {
        console.log(`-- ${route}`);
      });
    });
  }
}
```

- Initialize and run the app in `server.ts`

```typescript
import { App } from ".";

const app = new App({
  port: 8080,
  hostname: "localhost",
  prefix: "/api",
});

app.printRoutes();
```

Run the app and print the routes

```bash
bun run src/server.ts

# should see the route methods logged out
# GET
# POST
# PUT
# PATCH
# DELETE
```

## Routing

Routing is the process of matching a URL to a specific handler. In Express, you can use methods like `app.get`, `app.post`, and others to define routes. For our implementation, we'll create a `route` method that takes three parameters: the HTTP method, the route path, and a handler function. This handler will be an asynchronous function that receives a request object and a server object as arguments, allowing it to process incoming requests and generate appropriate responses.

```typescript
// src/app.ts
export interface AddMethodProps {
  method?: Request["method"];
  path?: string;
  handler: IHandler;
}

export class App implements IApp {
	//...

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
}
```

Add a basic route to the app and print the routes

```typescript
// src/server.ts
const app = new App({
  port: 8080,
  hostname: "localhost",
  prefix: "/api",
});

app.get("/hello", (request, server, params) => {
  return Response.json({ message: "Hello, world!" });
});

app.printRoutes();
```

Again, run the app and you should see the route methods logged out
```bash
bun run src/server.ts

# should see the route methods logged out
# GET
# -- /api/hello
```

## Server

We'll add the rest of the routes after we create the server. This approach allows us to set up the basic server structure first, ensuring that our routing system is functional before adding more complex routes

```typescript
// src/app.ts
// same path match regex package used by Express
import { pathToRegexp } from "path-to-regexp"; 

export interface IApp {
  //...
  server?: Server;
}

export class App implements IApp {
  //...
  server?: Server;

  serve() {
    // Create the server using Bun.serve, which is a built-in server for Bun
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
}
```

Add the server to the app and print the routes:

```typescript
// src/server.ts
//...
app.printRoutes();

app.serve();
```

Run the app and you should see the routes logged out, with "Listening on localhost:8080" at the end

```bash
➜ bun run src/server.ts
GET
-- /api/hello
POST
PUT
PATCH
DELETE
Listening on localhost:8080
```

Test the route

```bash
➜ curl http://localhost:8080/api/hello
{"message":"Hello, world!"}%                                                                                   
```

Nice! We have a working route!

## Add the rest of the route methods

```typescript
// src/app.ts
export class App implements IApp {

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
```

### Add the rest of the routes to the app

```typescript
// src/server.ts
app.get("/hello", async (request, server) => {
  return Response.json({ message: "Hello, world!" });
});

app.get("/hello/:id", async (request, server, params) => {
  const id = params?.["id"];
  return Response.json({
    message: `Hello, world! Your id is ${id}`,
  });
});

app.post("/hello", async (request) => {
  const body = await request.json();
  return Response.json({ message: "Added POST method", body });
});

app.put("/hello/:id", async (request, server, params) => {
  const id = params?.["id"];
  return Response.json({ message: `Added PUT method for ${id}` });
});

app.patch("/hello/:id", async (request, server, params) => {
  const id = params?.["id"];
  return Response.json({ message: `Added PATCH method for ${id}` });
});

app.delete("/hello/:id", async (request, server, params) => {
  const id = params?.["id"];
  return Response.json({ message: `Added DELETE method for ${id}` });
});
```

Run the app and you should see the routes logged out

```bash
➜ bun run src/server.ts

# GET
# -- /api/hello
# -- /api/hello/:id
# POST
# -- /api/hello
# PUT
# -- /api/hello/:id
# PATCH
# -- /api/hello/:id
# DELETE
# -- /api/hello/:id
# Listening on localhost:8080
```

Now we can use curl to test our routes

```bash
➜ curl http://localhost:8080/api/hello
{"message":"Hello, world!"}

➜ curl http://localhost:8080/api/hello/123
{"message":"Hello, world! Your id is 123"}

#  add body
➜ curl -X POST http://localhost:8080/api/hello -d '{"name": "John"}' -H "Content-Type: application/json"
{"message":"Added POST method","body":{"name":"John"}}

➜ curl -X PUT http://localhost:8080/api/hello/123
{"message":"Added PUT method for 123"}

➜ curl -X PATCH http://localhost:8080/api/hello/123
{"message":"Added PATCH method for 123"}

➜ curl -X DELETE http://localhost:8080/api/hello/123
{"message":"Added DELETE method for 123"}
```

Before moving on to the next section, let's add another method, `use`, to the app class, so we can add a route handler for all methods

```typescript
// src/app.ts
export class App implements IApp {
  //...
    /**
   * Add a USE route
   * @param {AddMethodProps} props - The {method, path, handler} for the route
   */
    use(props: AddMethodProps) {
    const { method, path, handler } = props;

    if (!path) {
      return new Error("Path is required");
    }

    if (!handler?.length) {
      return new Error("Handler is required");
    }

    if (method) {
      // if method, path and handler, add the handler to the route
      this.addMethod({ method, path, handler });
      return;
    }

    // if no method, apply the handler to all routes with the path
    if (!method) {
      this.routes.forEach((route) => {
        if (this.prefix) {
          route.set(`${this.prefix}${path}`, handler);
        } else {
          route.set(path, handler);
        }
      });
      return;
    }

    // get the routes
    this.routes.forEach((value) => {
      console.log(value);
      // get the routes
      value.forEach((handler, _path) => {
        // check if the path matches
        if (path === _path) {
          // set the handler
          if (this.prefix) {
            value.set(`${this.prefix}${path}`, handler);
          } else {
            value.set(path, handler);
          }
        }
      });
    });
  }
}
```

### Add a `use` method to the app

```typescript
// src/server.ts
app.use({
  path: "/goodbye",
  handler: async (req, server) => {
    return Response.json({ message: "Response from ALL routes" });
  },
  // method: "GET", // if method included, apply only to that method. Else it applies to all
});

```

Run the app and you should see the routes logged out

```bash
➜ bun run --watch walkthrough/server.ts
GET
-- /api/hello
-- /api/hello/:id
-- /api/goodbye
POST
-- /api/hello
-- /api/goodbye
PUT
-- /api/hello/:id
-- /api/goodbye
PATCH
-- /api/hello/:id
-- /api/goodbye
DELETE
-- /api/hello/:id
-- /api/goodbye
```

Test the route

```bash
➜ curl http://localhost:8080/api/goodbye
{"message":"Response from ALL routes"}
```

---

## Middleware

Middleware is a function that runs before the route handler. In Express, this takes the form of a function with three arguments: `req`, `res`, and `next`. Personally, I'm not a fan of that pattern, so we'll use a different one.

```typescript
// src/app.ts

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

export class App {
  //...
  middleware: Map<string, IMiddleware> = new Map();

  serve() {
    this.server = Bun.serve({
      //...
      fetch: async (request, server) => {
        //...

        if (!methodRoutes) {
          return Response.json(
            { message: "Method routes not found" },
            { status: 404 }
          );
        }

        for await (const [_name, middleware] of this.middleware) {
          try {
            const response = await middleware(request, server);

            if (!response.ok) {
              return Response.json(response.data, {
                status: response.status,
                statusText: response.statusText,
              });
            }
          } catch (error) {
            if (error instanceof Response) {
              return error;
            }

            return Response.json({ message: String(error) }, { status: 500 });
          }
        }

        //...
      },
    });
  }

  /**
   * Add a middleware
   * @param {IMiddleware} middleware - The middleware to add
   */
  setMiddleware(middleware: IMiddleware[]) {
    middleware.forEach((fn) => {
      this.middleware.set(fn.name, fn);
    });
  }

  printMiddleware() {
    this.middleware.forEach((_middleware, name) => {
      console.log(`Middleware: ${name}`);
    });
  }
}
```

### Add middleware to the app

```typescript
// src/server.ts
app.printRoutes();

app.setMiddleware([
  async function middleware1(req, server) {
    console.log("middleware 1");
    return {
      ok: true,
      data: {},
      status: 200,
      statusText: "Ok",
    };
  },
  async function middleware2(req, server) {
    console.log("middleware 2");
    return {
      ok: true,
      data: {},
      status: 200,
      statusText: "Ok",
    };
  },
]);

app.printMiddleware();

app.serve();
```

Run the app and you should see the middleware logged out

```bash
➜ bun run src/server.ts
# GET
# -- /api/hello
# -- /api/hello/:id
# POST
# -- /api/hello
# PUT
# -- /api/hello/:id
# PATCH
# -- /api/hello/:id
# DELETE
# -- /api/hello/:id
# Middleware: middleware1
# Middleware: middleware2
# Listening on localhost:8080
```

Test the middleware

```bash
➜ curl http://localhost:8080/api/hello
# middleware 1 (server logs)
# middleware 2 (server logs)
{"message":"Hello, world!"}
```

---

## Conclusion

In this tutorial, we've accomplished the following:

1. Created a lightweight Express-like framework using Bun
2. Explored key concepts of web development, including:
   - Routing: Handling different HTTP methods and URL paths
   - Middleware: Adding reusable functions to process requests
   - Request and Response objects: Managing incoming data and outgoing responses

What's next? In a future post, we'll expand our framework's capabilities by adding:

- JSON and form data parsing for easier request handling
- Static file serving to deliver assets like images and stylesheets
- React rendering for dynamic front-end experiences
- WebSocket support for real-time communication

Stay tuned for more advanced features and improvements!

You can see the full code [here](https://github.com/Antler-Digital/bun-express)
Full code:

```typescript
// src/app.ts
import type { Server } from "bun";
import { pathToRegexp, match } from "path-to-regexp";

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

export class App implements IApp {
  // Nested Map to hold all of the routes. Easy to get, set and iterate over.
  routes: Map<Request["method"], Map<string, IHandler>> = new Map();
  // Default port and hostname
  port = 8080;
  hostname = "localhost";
  // Optional prefix for all routes
  prefix: string;
  server?: Server;
  middleware: Map<string, IMiddleware> = new Map();

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

        for await (const [_name, middleware] of this.middleware) {
          try {
            const response = await middleware(request, server);

            if (!response.ok) {
              return Response.json(response.data, {
                status: response.status,
                statusText: response.statusText,
              });
            }
          } catch (error) {
            if (error instanceof Response) {
              return error;
            }

            return Response.json({ message: String(error) }, { status: 500 });
          }
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

  printMiddleware() {
    this.middleware.forEach((_middleware, name) => {
      console.log(`Middleware: ${name}`);
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

  /**
   * Add a USE route
   * @param {AddMethodProps} props - The {method, path, handler} for the route
   */
  use(props: AddMethodProps) {
    const { method, path, handler } = props;

    if (!path) {
      return new Error("Path is required");
    }

    if (!handler?.length) {
      return new Error("Handler is required");
    }

    if (method) {
      // if method, path and handler, add the handler to the route
      this.addMethod({ method, path, handler });
      return;
    }

    // if no method, apply the handler to all routes with the path
    if (!method) {
      this.routes.forEach((route) => {
        if (this.prefix) {
          route.set(`${this.prefix}${path}`, handler);
        } else {
          route.set(path, handler);
        }
      });
      return;
    }

    // get the routes
    this.routes.forEach((value) => {
      console.log(value);
      // get the routes
      value.forEach((handler, _path) => {
        // check if the path matches
        if (path === _path) {
          // set the handler
          if (this.prefix) {
            value.set(`${this.prefix}${path}`, handler);
          } else {
            value.set(path, handler);
          }
        }
      });
    });
  }

  /**
   * Add a middleware
   * @param {IMiddleware} middleware - The middleware to add
   */
  setMiddleware(middleware: IMiddleware[]) {
    middleware.forEach((fn) => {
      this.middleware.set(fn.name, fn);
    });
  }
}
```

```typescript
// src/server.ts
import { App } from ".";

const app = new App({
  port: 8080,
  hostname: "localhost",
  prefix: "/api",
});

app.get("/hello", async (request, server) => {
  return Response.json({ message: "Hello, world!" });
});

app.get("/hello/:id", async (request, server, params) => {
  const id = params?.["id"];
  return Response.json({
    message: `Hello, world! Your id is ${id}`,
  });
});

app.post("/hello", async (request) => {
  const body = await request.json();
  return Response.json({ message: "Added POST method", body });
});

app.put("/hello/:id", async (request, server, params) => {
  const id = params?.["id"];
  return Response.json({ message: `Added PUT method for ${id}` });
});

app.patch("/hello/:id", async (request, server, params) => {
  const id = params?.["id"];
  return Response.json({ message: `Added PATCH method for ${id}` });
});

app.delete("/hello/:id", async (request, server, params) => {
  const id = params?.["id"];
  return Response.json({ message: `Added DELETE method for ${id}` });
});

app.use({
  path: "/goodbye",
  handler: async (req, server) => {
    return Response.json({ message: "Response from ALL routes" });
  },
  // method: "GET", // if method included, apply only to that method. Else it applies to all
});

app.printRoutes();

app.setMiddleware([
  async function middleware1(req, server) {
    console.log("middleware 1");
    return {
      ok: true,
      data: {},
      status: 200,
      statusText: "Ok",
    };
  },
  async function middleware2(req, server) {
    console.log("middleware 2");
    return {
      ok: true,
      data: {},
      status: 200,
      statusText: "Ok",
    };
  },
]);

app.printMiddleware();

app.serve();
```