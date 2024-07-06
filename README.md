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

- Express is a very popular framework
- While possible to run Express with Bun, it still uses the same Node.js runtime
- Good way to learn more about both is to build your own
- Features we'll build to understand Express:
  - Routing
  - Middleware
  - Request and Response objects
  - Static files
  - Template rendering (with React)
  - JSON and form data parsing
  - WebSockets
  - Testing
- Things we won't be diving into (yet)
  - File uploads
  - Cookies and sessions
  - Error handling
- The end result won't look exactly like Express, but it will be a good starting point for understanding how it works
- And its _fast_!

### Getting Started

- Install Bun and create a new project

```bash
# Mac / Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"

# check version to make sure its installed
bun --version # 1.1.18
```

- Create a new project

```bash
mkdir -p bun-express/src && cd bun-express

bun init
```

- Install dependencies

```bash
# dependencies
bun add react react-dom path-to-regexp

# dev dependencies
# @types/bun should be installed by default with bun init but install it if it isn't
bun add -D @types/react @types/react-dom
```

- Create the App class
- Like when using Express, we'll create the app class in `app.ts`, then initialize and run it in `server.ts`

```typescript
// src/app.ts
import type { Server } from "bun";

export type IHandler = (req: Request, server: Server) => Promise<Response>;

export interface IApp {
  routes: Map<Request["method"], Map<string, IHandler>>;
  port: number;
  hostname: string;
  prefix?: string;
}

export class App implements IApp {
  // Nested Map to hold all of the routes. Easy to get, set and iterate over.
  routes: Map<Request["method"], Map<string, IHandler>> = new Map();
  // Default port and hostname
  port = 8080;
  hostname = "localhost";
  // Optional prefix for all routes
  prefix: string;

  // Constructor to set the port, hostname and prefix, but they're optional
  constructor({
    port = Number(process.env.PORT) || 8080,
    hostname = process.env.HOSTNAME || "localhost",
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

- Run the app

```bash
bun run src/server.ts

# should see the route methods logged out
# GET
# POST
# PUT
# PATCH
# DELETE
```

### Routing

- Routing is the process of matching a URL to a specific handler
- In Express, you can use `app.get`, `app.post`, etc. to define routes
- We'll create a `route` method that takes a method, route and handler
- The handler will be an async function that takes a request and server object

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

- Add a route to the app

```typescript
// src/server.ts
app.get("/hello", (request, server) => {
  return Response.json({ message: "Hello, world!" });
});

app.printRoutes();
```

- Run the app

```bash
bun run src/server.ts

# should see the route methods logged out
# GET
# -- /api/hello
```

- Create the server
- We'll add the rest of the routes after we create the server

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

          // If matched, call the handler
          if (matched) {
            try {
              const res = await _handler(request, server);

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

- Add the server to the app

```typescript
// src/server.ts
//...
app.printRoutes();

app.serve();
```

- Run the app

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

- Test the route

```bash
➜ curl http://localhost:8080/api/hello
{"message":"Hello, world!"}%                                                                                   
```

Nice! We have a working route!

- Add the rest of the routes

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

- Add the rest of the routes

```typescript
// src/server.ts
app.post("/hello", (request, server) => {
  return Response.json({ message: "Added POST method" });
});

app.put("/hello", (request, server) => {
  return Response.json({ message: "Added PUT method" });
});

app.patch("/hello", (request, server) => {
  return Response.json({ message: "Added PATCH method" });
});

app.delete("/hello", (request, server) => {
  return Response.json({ message: "Added DELETE method" });
});
```

- Run the app

```bash
➜ bun run src/server.ts

# GET
# -- /api/hello
# POST
# -- /api/hello
# PUT
# -- /api/hello
# PATCH
# -- /api/hello
# DELETE
# -- /api/hello
# Listening on localhost:8080
```