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

app.post("/hello", async () => {
  return Response.json({ message: "Added POST method" });
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

app.printRoutes();

app.serve();
