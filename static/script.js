async function analyzeSmartRoom() {

    console.log("Analyse lancée");

    const predictionForm = document.getElementById("predictionForm");

    if (!predictionForm) {
        console.error("predictionForm introuvable !");
        return;
    }

    const formData = new FormData(predictionForm);

    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    console.log("Données envoyées :", data);

    try {

        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log("Réponse reçue :", response);

        const result = await response.json();

        console.log("Résultat :", result);

        document.getElementById("presence-result").textContent =
            result.presence || "Analyse terminée";

        document.getElementById("voltage-result").textContent =
            result.voltage_analysis || "Analyse terminée";

        document.getElementById("load-result").textContent =
            result.load_analysis || "Analyse terminée";

        if (result.advice) {
            document.getElementById("advice-result").textContent =
                result.advice;
        }

    } catch (error) {

        console.error("Erreur :", error);

        document.getElementById("advice-result").textContent =
            "Erreur lors de l'analyse.";

    }
}
document.addEventListener("DOMContentLoaded", function () {

    const predictionForm = document.getElementById("predictionForm");

    predictionForm.addEventListener("submit", function(event) {

        event.preventDefault();

        analyzeSmartRoom();

    });

});
