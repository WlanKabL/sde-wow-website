window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    const statusElement = document.getElementById("status");

    if (code && state) {
        console.log("✅ OAuth Code:", code);
        console.log("✅ OAuth State:", state);

        try {
            const response = await fetch("/transfer-oauth", {
                method: "POST",
                headers: { "Content-Type": "application/json" }, // WICHTIG: JSON-Header setzen
                body: JSON.stringify({ code, state }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Server antwortete mit Status ${response.status}`);
            }

            console.log("📥 Server Response:", result);

            statusElement.innerText = "✅ Sie können diese Seite jetzt schließen.";
            statusElement.classList.remove("loading");
            statusElement.classList.add("success");
        } catch (error) {
            console.error("❌ Fehler beim Senden der OAuth-Daten:", error);
            
            // Detaillierte Fehleranzeige
            statusElement.innerText = `❌ Fehler: ${error.message}`;
            statusElement.classList.add("error");
        }
    } else {
        statusElement.innerText = "❌ Fehler: Fehlende OAuth-Daten.";
        statusElement.classList.add("error");
    }
};
