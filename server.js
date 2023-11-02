// @ts-check

import next from "next";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { parse } from "url";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    if (!req.url) return;

    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl).catch((err) => {
      console.log("errrr", err);
    });
  });
  const wss = new WebSocketServer(dev ? { port: port + 1 } : { server });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    ws.send("Connected to WebSocket server");

    ws.on("message", (message) => {
      console.log(`Received message => ${message}`);
      ws.send(`Hello, you sent => ${message}`);
    });
  });
  wss.on("close", () => console.log("WebSocket was closed"));
  wss.on("error", (err) => console.log("WebSocket error", err));

  if (!dev) {
    server.on("upgrade", (req, socket, head) => {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    });
  }

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(
      `> [${dev ? "DEV" : "PROD"}] Ready on http://localhost:${port}`
    );
  });
});
