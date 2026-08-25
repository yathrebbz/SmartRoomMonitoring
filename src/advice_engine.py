# ==========================================
# SMART ROOM - ADVICE ENGINE
# ==========================================


def calculate_cost(energy_wh, price_per_kwh):
    """
    Calcule le coût de la consommation énergétique.

    energy_wh : énergie en Wh
    price_per_kwh : prix en TND/kWh
    """

    energy_kwh = energy_wh / 1000

    cost = energy_kwh * price_per_kwh

    return round(cost, 4)


def analyze_budget(cost, financial_goal):
    """
    Analyse si le coût respecte l'objectif financier.
    """

    remaining_budget = financial_goal - cost

    if cost > financial_goal:
        status = "budget_exceeded"
    elif cost > financial_goal * 0.8:
        status = "warning"
    else:
        status = "good"

    return {
        "cost": round(cost, 4),
        "financial_goal": financial_goal,
        "remaining_budget": round(remaining_budget, 4),
        "status": status
    }


def analyze_motion(motion_detected):
    """
    Analyse la présence dans la pièce.
    """

    if motion_detected:
        return {
            "motion": True,
            "status": "occupied",
            "message": "Mouvement détecté : la pièce semble occupée."
        }

    return {
        "motion": False,
        "status": "empty",
        "message": "Aucun mouvement détecté : pensez à réduire les appareils inutiles."
    }


def analyze_voltage(voltage):
    """
    Détection d'une surtension ou sous-tension.

    Valeurs indicatives pour un réseau nominal de 230 V.
    """

    if voltage > 253:
        return {
            "status": "overvoltage",
            "message": "⚠️ Surtension détectée."
        }

    elif voltage < 207:
        return {
            "status": "undervoltage",
            "message": "⚠️ Sous-tension détectée."
        }

    return {
        "status": "normal",
        "message": "✅ Tension électrique normale."
    }


def analyze_overload(current, max_current=10):
    """
    Détection d'une surcharge électrique.
    """

    if current > max_current:
        return {
            "status": "overload",
            "message": "🚨 Surcharge électrique détectée."
        }

    elif current > max_current * 0.8:
        return {
            "status": "warning",
            "message": "⚠️ Courant proche de la limite maximale."
        }

    return {
        "status": "normal",
        "message": "✅ Charge électrique normale."
    }


def generate_advice(
    energy_wh,
    budget_analysis,
    motion_analysis,
    voltage_analysis,
    overload_analysis
):
    """
    Génère des conseils intelligents.
    """

    advice = []

    # Budget
    if budget_analysis["status"] == "budget_exceeded":
        advice.append(
            "💰 Objectif financier dépassé : réduisez la consommation des appareils non essentiels."
        )

    elif budget_analysis["status"] == "warning":
        advice.append(
            "💰 Attention : vous approchez de votre limite financière."
        )

    else:
        advice.append(
            "✅ Votre consommation reste dans l'objectif financier."
        )

    # Mouvement
    if not motion_analysis["motion"]:
        advice.append(
            "🚶 Aucun mouvement détecté : éteignez les lumières et appareils inutilisés."
        )

    # Surtension
    if voltage_analysis["status"] == "overvoltage":
        advice.append(
            "⚡ Vérifiez vos équipements : une surtension peut endommager les appareils."
        )

    # Sous-tension
    elif voltage_analysis["status"] == "undervoltage":
        advice.append(
            "⚡ Une sous-tension est détectée : surveillez les équipements sensibles."
        )

    # Surcharge
    if overload_analysis["status"] == "overload":
        advice.append(
            "🚨 Réduisez immédiatement le nombre d'appareils connectés."
        )

    elif overload_analysis["status"] == "warning":
        advice.append(
            "⚠️ Évitez de connecter de nouveaux appareils."
        )

    # Consommation élevée
    if energy_wh > 500:
        advice.append(
            "🔋 Consommation élevée détectée : vérifiez les appareils énergivores."
        )

    return advice
