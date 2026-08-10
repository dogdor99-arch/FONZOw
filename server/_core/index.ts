import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerFonzoMediaProxy } from "./fonzoMedia";
import { registerSocialMediaProxy } from "./socialMedia";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerFonzoMediaProxy(app);
  registerSocialMediaProxy(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Development mode uses Vite, production mode uses static files with SPA fallback
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);

    // Fallback สำหรับ SPA Route ฝั่ง Client (แก้ปัญหา 404 เวลา Refresh หน้าอย่าง /admin)
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist/public/index.html"), (err) => {
        if (err) {
          res.sendFile(path.resolve(process.cwd(), "client/dist/index.html"));
        }
      });
    });
  }

  // ใช้พอร์ตจาก Environment Variable ของ Render โดยตรง
  const port = parseInt(process.env.PORT || "3000", 10);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);