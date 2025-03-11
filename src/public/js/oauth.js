window.onload = async () => {
    console.log("--------------------------------");

    const url = window.location.href.toLowerCase();
    const provider = url.includes("battlenet") ? "battlenet" : url.includes("warcraftlogs") ? "warcraftlogs" : "unknown";

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    const statusElement = document.getElementById("status");

    if (code && state && provider !== "unknown") {
        console.log(`✅ OAuth Code received from ${provider}:`, code);
        console.log("✅ OAuth State:", state);

        try {
            const response = await fetch("/transfer-oauth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, state, provider }),
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw { status: response.status, statusText: response.statusText, body: errorBody };
            }

            const result = await response.json();
            console.log("📥 Server Response:", result);

            statusElement.innerText = "✅ Sie können diese Seite jetzt schließen.";
            statusElement.classList.remove("loading");
            statusElement.classList.add("success");
        } catch (error) {
            console.error("❌ Fehler beim Senden der OAuth-Daten:", error);

            statusElement.innerText = error?.body?.error ? "❌ " + error.body.error : "❌ Fehler: Konnte OAuth-Daten nicht übertragen.";
            statusElement.classList.add("error");
        }
    } else {
        console.warn("❌ Fehler: Fehlende oder ungültige OAuth-Daten.");
        statusElement.innerText = "❌ Fehler: Fehlende OAuth-Daten oder unbekannter Anbieter.";
        statusElement.classList.add("error");
    }
};
