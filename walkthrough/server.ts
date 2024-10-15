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
