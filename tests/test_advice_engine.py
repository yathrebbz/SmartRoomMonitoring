import pytest

from backend.core import config
from backend.services.advice_engine import (
    analyze_budget,
    analyze_motion,
    analyze_overload,
    analyze_room,
    analyze_voltage,
    calculate_cost,
)


def test_calculate_cost():
    assert calculate_cost(650, 0.3) == pytest.approx(0.195)
    assert calculate_cost(0, 0.3) == 0


@pytest.mark.parametrize(
    "cost, goal, status",
    [
        (0.5, 1.0, "good"),
        (0.8, 1.0, "good"),  # exactement 80 % : pas encore d'alerte
        (0.9, 1.0, "warning"),
        (1.0, 1.0, "warning"),  # à la limite, pas encore dépassé
        (1.2, 1.0, "budget_exceeded"),
    ],
)
def test_analyze_budget_status(cost, goal, status):
    assert analyze_budget(cost, goal)["status"] == status


def test_analyze_budget_remaining():
    result = analyze_budget(0.195, 0.15)
    assert result["goal"] == 0.15
    assert result["remaining_budget"] == pytest.approx(-0.045)


def test_analyze_motion():
    assert analyze_motion(True)["status"] == "occupied"
    assert analyze_motion(True)["detected"] is True
    assert analyze_motion(False)["status"] == "empty"
    assert analyze_motion(False)["detected"] is False


@pytest.mark.parametrize(
    "voltage, status",
    [
        (230, "normal"),
        (253, "normal"),
        (207, "normal"),
        (260, "overvoltage"),
        (200, "undervoltage"),
    ],
)
def test_analyze_voltage(voltage, status):
    assert analyze_voltage(voltage)["status"] == status


@pytest.mark.parametrize(
    "current, status",
    [
        (5, "normal"),
        (7.9, "normal"),
        (8, "warning"),
        (9, "warning"),
        (10, "overload"),
        (12, "overload"),
    ],
)
def test_analyze_overload(current, status):
    assert analyze_overload(current, max_current=10)["status"] == status


def test_analyze_overload_default_max_current():
    assert analyze_overload(0)["max_current"] == config.DEFAULT_MAX_CURRENT


def test_analyze_room_all_clear():
    result = analyze_room(
        energy_wh=100,
        electricity_price=0.3,
        financial_goal=1.0,
        movement=True,
        voltage=230,
        current=2,
        max_current=10,
    )
    assert result["advice"] == [
        {"level": "info", "text": "Tout fonctionne normalement. Continuez ainsi !"}
    ]


def test_analyze_room_worst_case():
    # 650 Wh, pièce vide, surtension, courant proche de la limite, budget dépassé.
    result = analyze_room(650, 0.3, 0.15, movement=False, voltage=260, current=9, max_current=10)

    assert result["cost"] == pytest.approx(0.195)
    assert result["financial"]["status"] == "budget_exceeded"
    assert result["movement"]["status"] == "empty"
    assert result["voltage"]["status"] == "overvoltage"
    assert result["load"]["status"] == "warning"

    levels = [item["level"] for item in result["advice"]]
    texts = "\n".join(item["text"] for item in result["advice"])
    assert levels == ["critical", "warning", "critical", "warning", "warning"]
    assert "non essentiels" in texts
    assert "Aucun mouvement" in texts
    assert "Surtension" in texts
    assert "nouveaux appareils" in texts
    assert "Consommation élevée" in texts


def test_idle_advice_only_when_consumption_is_significant():
    quiet = analyze_room(100, 0.3, 1.0, movement=False, voltage=230, current=1)
    assert not any("Aucun mouvement" in item["text"] for item in quiet["advice"])

    busy = analyze_room(400, 0.3, 1.0, movement=False, voltage=230, current=1)
    assert any("Aucun mouvement" in item["text"] for item in busy["advice"])


def test_analyze_room_structure():
    result = analyze_room(250, 0.3, 1.0, movement=True, voltage=230, current=5)
    assert set(result) == {
        "prediction",
        "cost",
        "financial",
        "movement",
        "voltage",
        "load",
        "advice",
    }
    assert result["prediction"] == 250
