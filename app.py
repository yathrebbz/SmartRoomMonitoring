from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# ==========================================
# CHARGEMENT DU MODELE IA
# ==========================================

MODEL_PATH = "models/smart_room_energy_model.pkl"
FEATURES_PATH = "models/model_features.pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    with open(FEATURES_PATH, "rb") as f:
        model_features = pickle.load(f)

    print("Modèle IA chargé avec succès !")
    print("Variables :", model_features)

except Exception as e:
    print("Erreur lors du chargement du modèle :", e)
    model = None
    model_features = []


# ==========================================
# PAGE PRINCIPALE
# ==========================================

@app.route("/")
def home():
    return render_template("index.html")


# ==========================================
# API DE PREDICTION
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    if model is None:
        return jsonify({
            "error": "Le modèle IA n'est pas disponible."
        }), 500

    try:
        data = request.get_json()

        # ----------------------------------
        # RECUPERATION DES 7 VARIABLES
        # ----------------------------------

        input_data = {}

        for feature in model_features:

            if feature not in data:
                return jsonify({
                    "error": f"Variable manquante : {feature}"
                }), 400

            input_data[feature] = float(data[feature])

        # DataFrame avec les bonnes colonnes
        input_df = pd.DataFrame(
            [input_data],
            columns=model_features
        )

        # ----------------------------------
        # PREDICTION IA
        # ----------------------------------

        prediction = float(model.predict(input_df)[0])

        # Protection : consommation négative
        prediction = max(0, prediction)

        # ----------------------------------
        # PRIX ELECTRICITE
        # ----------------------------------

        electricity_price = float(
            data.get("electricity_price", 0.3)
        )

        cost = (prediction / 1000) * electricity_price

        # ----------------------------------
        # OBJECTIF FINANCIER
        # ----------------------------------

        financial_goal = float(
            data.get("financial_goal", 1.0)
        )

        remaining_budget = financial_goal - cost

        if cost > financial_goal:
            financial_status = "budget_exceeded"
            financial_message = (
                "Objectif financier dépassé."
            )

        elif cost > financial_goal * 0.8:
            financial_status = "warning"
            financial_message = (
                "Attention : vous êtes proche de votre limite."
            )

        else:
            financial_status = "good"
            financial_message = (
                "Votre consommation respecte votre objectif."
            )

        # ----------------------------------
        # ANALYSE DU MOUVEMENT
        # ----------------------------------

        movement = data.get("movement", False)

        if movement:
            movement_status = "occupied"
            movement_message = (
                "Mouvement détecté : la pièce semble occupée."
            )
        else:
            movement_status = "empty"
            movement_message = (
                "Aucun mouvement détecté."
            )

        # ----------------------------------
        # ANALYSE DE LA TENSION
        # ----------------------------------

        voltage = float(
            data.get("voltage", 230)
        )

        if voltage > 250:
            voltage_status = "overvoltage"
            voltage_message = (
                "⚠ Surtension détectée."
            )

        elif voltage < 200:
            voltage_status = "undervoltage"
            voltage_message = (
                "⚠ Sous-tension détectée."
            )

        else:
            voltage_status = "normal"
            voltage_message = (
                "Tension normale."
            )

        # ----------------------------------
        # ANALYSE DU COURANT / SURCHARGE
        # ----------------------------------

        current = float(
            data.get("current", 0)
        )

        max_current = float(
            data.get("max_current", 10)
        )

        if current >= max_current:
            load_status = "overload"
            load_message = (
                "⚠ Surcharge détectée."
            )

        elif current >= max_current * 0.8:
            load_status = "warning"
            load_message = (
                "Attention : courant proche de la limite."
            )

        else:
            load_status = "normal"
            load_message = (
                "Charge normale."
            )

        # ----------------------------------
        # CONSEILS INTELLIGENTS
        # ----------------------------------

        advice = []

        if financial_status == "budget_exceeded":
            advice.append(
                "💰 Réduisez l'utilisation des appareils non essentiels."
            )

        elif financial_status == "warning":
            advice.append(
                "🎯 Surveillez votre consommation pour rester sous votre objectif."
            )

        if not movement and prediction > 300:
            advice.append(
                "🚶 Aucun mouvement détecté : éteignez les appareils inutilisés."
            )

        if voltage_status == "overvoltage":
            advice.append(
                "⚡ Vérifiez vos équipements : une surtension peut les endommager."
            )

        if voltage_status == "undervoltage":
            advice.append(
                "⚡ Vérifiez l'alimentation électrique."
            )

        if load_status == "overload":
            advice.append(
                "🔥 Débranchez certains appareils pour réduire la surcharge."
            )

        elif load_status == "warning":
            advice.append(
                "⚠ Évitez de connecter de nouveaux appareils."
            )

        if prediction > 500:
            advice.append(
                "🔋 Consommation élevée : identifiez les appareils énergivores."
            )

        if len(advice) == 0:
            advice.append(
                "✅ Tout fonctionne normalement. Continuez ainsi !"
            )

        # ----------------------------------
        # RESULTAT FINAL
        # ----------------------------------

        return jsonify({

            "prediction": round(prediction, 2),

            "cost": round(cost, 3),

            "financial": {
                "goal": financial_goal,
                "remaining_budget": round(remaining_budget, 3),
                "status": financial_status,
                "message": financial_message
            },

            "movement": {
                "detected": movement,
                "status": movement_status,
                "message": movement_message
            },

            "voltage": {
                "value": voltage,
                "status": voltage_status,
                "message": voltage_message
            },

            "load": {
                "current": current,
                "max_current": max_current,
                "status": load_status,
                "message": load_message
            },

            "advice": advice
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

@app.route("/api/advice")
def get_advice():
    try:
        return jsonify({
            "presence": {
                "status": "Normal",
                "message": "Aucune anomalie de présence détectée."
            },
            "voltage": {
                "status": "Normal",
                "message": "La tension électrique est stable."
            },
            "load": {
                "status": "Normal",
                "message": "La consommation électrique est dans la plage normale."
            },
            "advice": "Le système fonctionne normalement. Continuez à surveiller les données."
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500
# ==========================================
# LANCEMENT DU SERVEUR
# ==========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
