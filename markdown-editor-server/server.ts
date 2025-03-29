import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());

app.get("/", (_req, res) => {
    res.send("Markdown Editor backend is running!");
});

let document: any = ""

wss.on("connection", (ws) => {
    console.log("🟢 WebSocket client connected");

    ws.send(JSON.stringify({ type: "init", data: document }))
    ws.on("message", (message: any) => {
        try {
            const parsedMessage = JSON.parse(message)
            if (parsedMessage.type === 'update') {
                document = parsedMessage.data

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'update', data: document }))
                    }
                })
            }

        } catch (error) {
            console.log("Error parsing message", error)
        }
        console.log("Received:", message.toString());


        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on("close", () => {
        console.log("🔴 WebSocket client disconnected");
    });
});

const PORT = process.env.PORT
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});