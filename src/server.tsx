import { renderToReadableStream } from "react-dom/server";
import path from "path";
import { App } from ".";
import { Home } from "./templates/Home";

const app = new App({
  port: 4000,
});

app.get("/", async (req, server) => {
  return Response.json({ message: "Response from GET /" });
});

app.get("/api/test", async (req, server) => {
  return Response.json({ message: "Response from GET /api/test" });
});

app.post("/api/test", async (req, server) => {
  const body = await req.json();
  return Response.json(body);
});

app.put("/api/test", async (req, server) => {
  const body = await req.json();
  return Response.json(body);
});

app.delete("/api/test", async (req, server) => {
  return Response.json({ message: "Response from DELETE /api/test" });
});

app.use({
  handler: async (req, server) => {
    return Response.json({ message: "Response from ALL routes" });
  },
});

app.setMiddleware([
  async (req, server) => {
    console.log("middleware 1");
    return {
      ok: true,
      data: {},
      status: 200,
      statusText: "Ok",
    };
  },
  async (req, server) => {
    console.log("middleware 2");
    return {
      ok: true,
      data: {},
      status: 200,
      statusText: "Ok",
    };
  },
]);

/**
 * This is a route that uses a React component to render the response
 */
app.get("/react", async (req, server) => {
  const stream = await renderToReadableStream(<Home name="Jack" />);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/html",
    },
  });
});

/**
 * This is a route that renders raw HTML
 */
app.get("/html", async (req, server) => {
  return new Response(Bun.file(path.join(__dirname, "./templates/home.html")), {
    headers: {
      "Content-Type": "text/html",
    },
  });
});

/**
 * This is a route that renders an image
 */
app.get("/image", async (req, server) => {
  return new Response(
    Bun.file(path.join(__dirname, "../public/a tale of two empires.jpg")),
    {
      headers: {
        "Content-Type": "image/jpeg",
      },
    }
  );
});

app.socket({
  port: 5000,
});

app.serve();
