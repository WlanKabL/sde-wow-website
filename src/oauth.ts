import { Router } from "express";
import { OAuthPayload } from "./types";
import { sendOAuthData } from "./websocket";

const router = Router();

router.post("/transfer-oauth", async (req: any, res: any) => {
    const { code, state }: OAuthPayload = req.body;

    if (!code || !state) {
        return res.status(400).json({ error: "Missing parameters.", type: "invalid_request" });
    }

    console.log("✅ OAuth Callback received:", { code, state });

    try {
        const response = await sendOAuthData({ code, state });

        if (response?.status === "success") {
            return res.status(200).json({ message: "OAuth successfully transferred.", type: "success" });
        } else {
            return res.status(500).json({
                error: response?.message || "Unknown error occurred.",
                type: response?.type || "internal_error",
            });
        }
    } catch (error) {
        console.error("❌ Error sending OAuth data:", error);
        return res.status(500).json({ error: "WebSocket connection failed.", type: "websocket_error" });
    }
});

export default router;
