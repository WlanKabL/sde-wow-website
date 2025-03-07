import WebSocket from "ws";
import { OAuthPayload } from "./types";
import { clear } from "console";

const WEBSOCKET_URL = "ws://localhost:3001"; // Adresse des Discord-Bot-WebSockets

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
        console.log("❌ Verbindung verloren. Erneuter Versuch in 5 Sekunden...");
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

        ws.send(JSON.stringify(data));
        console.log("📤 OAuth-Daten gesendet:", data);

        // Listener für eine Antwort
        const handleMessage = (message: WebSocket.RawData) => {
            try {
                const response = JSON.parse(message.toString());
                resolve(response);
            } catch (error) {
                reject({ message: "Failed to parse response.", type: "response_error" });
            }
        };

        ws.once("message", handleMessage);

        // Timeout, falls keine Antwort kommt (5s)
        setTimeout(() => {
            ws?.off("message", handleMessage);
            reject({ message: "No response from WebSocket.", type: "timeout" });
        }, 5000);
    });
};
