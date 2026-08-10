import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerFonzoMediaProxy } from "./fonzoMedia";
import { registerSocialMediaProxy } from "./socialMedia";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

// ดักจับ Error ทั้งหมดเพื่อแสดง Log บน Render ชัดเจน
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

async function startServer() {
  try {
    const app = express();
    const server = createServer(app);

    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    registerStorageProxy(app);
    registerOAuthRoutes(app);
    registerFonzoMediaProxy(app);
    registerSocialMediaProxy(app);

    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);

      app.get("*", (req, res) => {
        res.sendFile(path.resolve(process.cwd(), "dist/public/index.html"), (err) => {
          if (err) {
            res.sendFile(path.resolve(process.cwd(), "client/dist/index.html"));
          }
        });
      });
    }

    const port = parseInt(process.env.PORT || "3000", 10);

    server.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();