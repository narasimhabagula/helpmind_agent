// @lovable.dev/vite-tanstack-config already includes TanStack plugins
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

function apiMiddlewarePlugin(): Plugin {
  return {
    name: "api-backend-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          return next();
        }

        try {
          const { handleApiRequest } = await server.ssrLoadModule("/src/server/agent-backend.ts");

          const protocol = req.headers["x-forwarded-proto"] || "http";
          const host = req.headers.host || "localhost:8080";
          const fullUrl = `${protocol}://${host}${req.url}`;

          let body: string | undefined = undefined;
          if (req.method !== "GET" && req.method !== "HEAD") {
            const chunks: Uint8Array[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
            body = Buffer.concat(chunks).toString("utf-8");
          }

          const headers: Record<string, string> = {};
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === "string") headers[k] = v;
            else if (Array.isArray(v)) headers[k] = v.join(", ");
          }

          const init: RequestInit = {
            method: req.method || "GET",
            headers,
          };
          if (body && body.length > 0) {
            init.body = body;
          }

          const webReq = new Request(fullUrl, init);

          const webRes: Response = await handleApiRequest(webReq);

          res.statusCode = webRes.status;
          webRes.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });
          const resBody = await webRes.text();
          res.end(resBody);
        } catch (err) {
          console.error("Vite API middleware error:", err);
          next(err);
        }
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [apiMiddlewarePlugin()],
  },
});
