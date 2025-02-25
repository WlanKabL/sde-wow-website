import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import oauth from "./oauth";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 🔹 Middleware für JSON & URL-encoded Requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Optional: für API-Zugriffe von anderen Domains

// 🔹 Statische Dateien bereitstellen (HTML, CSS, JS für die OAuth-Seite)
app.use(express.static(path.join(__dirname, "public")));

// 🔹 OAuth-Route einbinden
app.use("/", oauth);

// 🔹 Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});
