"""Moteur de règles : coût, budget, présence, tension, surcharge et conseils.

Seule source de vérité pour l'analyse d'une lecture ; le service
:mod:`backend.services.analysis` compose ces règles avec la prédiction du modèle.
"""

from backend.core import config


def calculate_cost(energy_wh, price_per_kwh):
    """Coût (TND) d'une consommation en Wh au prix ``price_per_kwh`` (TND/kWh)."""
    return round(energy_wh / 1000 * price_per_kwh, 4)


def analyze_budget(cost, financial_goal):
    if cost > financial_goal:
        status = "budget_exceeded"
        message = "Objectif financier dépassé."
    elif cost > financial_goal * config.BUDGET_WARNING_RATIO:
        status = "warning"
        message = "Vous êtes proche de votre limite."
    else:
        status = "good"
        message = "Votre consommation respecte votre objectif."

    return {
        "goal": financial_goal,
        "remaining_budget": round(financial_goal - cost, 4),
        "status": status,
        "message": message,
    }


def analyze_motion(movement):
    if movement:
        return {
            "detected": True,
            "status": "occupied",
            "message": "Mouvement détecté : la pièce semble occupée.",
        }
    return {
        "detected": False,
        "status": "empty",
        "message": "Aucun mouvement détecté.",
    }


def analyze_voltage(voltage):
    """Surtension / sous-tension par rapport au réseau nominal de 230 V (±10 %)."""
    if voltage > config.OVERVOLTAGE_THRESHOLD:
        status = "overvoltage"
        message = f"Surtension détectée ({voltage:g} V)."
    elif voltage < config.UNDERVOLTAGE_THRESHOLD:
        status = "undervoltage"
        message = f"Sous-tension détectée ({voltage:g} V)."
    else:
        status = "normal"
        message = "Tension normale."

    return {"value": voltage, "status": status, "message": message}


def analyze_overload(current, max_current=config.DEFAULT_MAX_CURRENT):
    if current >= max_current:
        status = "overload"
        message = f"Surcharge détectée ({current:g} A pour un maximum de {max_current:g} A)."
    elif current >= max_current * config.CURRENT_WARNING_RATIO:
        status = "warning"
        message = "Courant proche de la limite."
    else:
        status = "normal"
        message = "Charge normale."

    return {
        "current": current,
        "max_current": max_current,
        "status": status,
        "message": message,
    }


def _advice(level, text):
    return {"level": level, "text": text}


def generate_advice(energy_wh, budget, motion, voltage, load):
    """Liste de conseils ``{level, text}`` ; ``level`` vaut info, warning ou critical."""
    advice = []

    if budget["status"] == "budget_exceeded":
        advice.append(
            _advice("critical", "Objectif financier dépassé : réduisez l'utilisation des appareils non essentiels.")
        )
    elif budget["status"] == "warning":
        advice.append(_advice("warning", "Surveillez votre consommation pour rester sous votre objectif."))

    if not motion["detected"] and energy_wh > config.IDLE_CONSUMPTION_WH:
        advice.append(_advice("warning", "Aucun mouvement détecté : éteignez les appareils inutilisés."))

    if voltage["status"] == "overvoltage":
        advice.append(_advice("critical", "Surtension : vérifiez vos équipements, elle peut les endommager."))
    elif voltage["status"] == "undervoltage":
        advice.append(_advice("critical", "Sous-tension : vérifiez l'alimentation électrique."))

    if load["status"] == "overload":
        advice.append(_advice("critical", "Surcharge : débranchez certains appareils pour réduire la charge."))
    elif load["status"] == "warning":
        advice.append(_advice("warning", "Courant proche de la limite : évitez de connecter de nouveaux appareils."))

    if energy_wh > config.HIGH_CONSUMPTION_WH:
        advice.append(_advice("warning", "Consommation élevée : identifiez les appareils énergivores."))

    if not advice:
        advice.append(_advice("info", "Tout fonctionne normalement. Continuez ainsi !"))

    return advice


def analyze_room(
    energy_wh,
    electricity_price,
    financial_goal,
    movement,
    voltage,
    current,
    max_current=config.DEFAULT_MAX_CURRENT,
):
    """Analyse complète d'une lecture ; renvoie la structure servie par ``/api/predict``."""
    cost = calculate_cost(energy_wh, electricity_price)
    budget = analyze_budget(cost, financial_goal)
    motion = analyze_motion(movement)
    voltage_analysis = analyze_voltage(voltage)
    load = analyze_overload(current, max_current)

    return {
        "prediction": round(energy_wh, 2),
        "cost": cost,
        "financial": budget,
        "movement": motion,
        "voltage": voltage_analysis,
        "load": load,
        "advice": generate_advice(energy_wh, budget, motion, voltage_analysis, load),
    }
