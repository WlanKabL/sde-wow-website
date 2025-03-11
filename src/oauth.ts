import { Router } from "express";
import { OAuthPayload } from "./types";
import { sendOAuthData } from "./websocket";

const router = Router();

router.post("/transfer-oauth", async (req: any, res: any) => {
    console.log("--------------------------------");

    const { code, state, provider }: OAuthPayload = req.body;

    if (!code || !state) {
        return res.status(400).json({ error: "Missing parameters.", type: "invalid_request" });
    }

    console.log("✅ OAuth Callback received:", { code, state, provider });

    try {
        const response = await sendOAuthData({ code, state, provider });

        if (response?.status === "success") {
            return res.status(200).json({ message: "OAuth successfully transferred.", type: "success" });
        } else {
            return res.status(500).json({
                error: response?.message || "Unknown error occurred.",
                type: response?.type || "websocket_error",
            });
        }
    } catch (error: any) {
        console.error("❌ Error sending OAuth data:", error);
        return res.status(500).json({ error: error?.message ?? "WebSocket connection failed.", type: "websocket_error" });
    }
});

export default router;
