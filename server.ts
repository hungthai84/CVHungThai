import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./api-routes"; // ESM extension compatibility

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Let Express parse JSON payloads up to 50MB
  app.use(express.json({ limit: "50mb" }));

  // Mount the shared API routes
  app.use("/api", apiRouter);


  // Serve using Vite middleware in development, and from dist in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
