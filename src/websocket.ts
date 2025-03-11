import WebSocket from "ws";
import { OAuthPayload } from "./types";
import dotenv from "dotenv";

dotenv.config();

const WEBSOCKET_URL = process.env.DISCORD_BOT_WS_URL ?? "ws://localhost:3001"; // Adresse des Discord-Bot-WebSockets

console.log('WEBSOCKET_URL: ', WEBSOCKET_URL);

let ws: WebSocket | null = null;
let isReconnecting = false;
let reconnectingTimeout: NodeJS.Timeout | null = null;

const connectWebSocket = () => {
    if (isReconnecting) return;

    ws = new WebSocket(WEBSOCKET_URL);

    ws.on("open", () => {
        console.log("✅ Verbunden mit dem WebSocket-Server (Discord-Bot).");
        clearTimeout(reconnectingTimeout!);
    });

    ws.on("message", (data) => {
        console.log("📥 Nachricht erhalten:", data.toString());
    });

    ws.on("close", () => {
        // console.log("❌ Verbindung verloren. Erneuter Versuch in 5 Sekunden...");
        reconnectingTimeout = setTimeout(connectWebSocket, 5000);
    });

    ws.on("error", (err) => {
        // console.error("❌ WebSocket-Fehler:", err);
    });
};

connectWebSocket();

/**
 * Send OAuth data via WebSocket and wait for a response.
 */
export const sendOAuthData = async (data: OAuthPayload): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            return reject({ message: "WebSocket is not connected.", type: "websocket_disconnected" });
        }

        const requestId = data.state; // Eindeutige ID für die Zuordnung der Antwort
        console.log("📤 Sending OAuth data.");

        const handleMessage = (message: WebSocket.RawData) => {
            try {
                const response = JSON.parse(message.toString());

                if (response.state === requestId) {
                    console.log("✅ Response received:", response);
                    ws?.off("message", handleMessage);
                    resolve(response);
                }
            } catch (error) {
                console.error("❌ Failed to parse response:", error);
                reject({ message: "Failed to parse response.", type: "response_error" });
            }
        };

        // WebSocket-Nachricht senden
        ws.send(JSON.stringify(data));

        // Event-Listener nur für dieses `state`
        ws.on("message", handleMessage);

        // Timeout nach 10 Sekunden
        setTimeout(() => {
            ws?.off("message", handleMessage);
            reject({ message: "No response from WebSocket.", type: "timeout", state: requestId });
        }, 10000);
    });
};
