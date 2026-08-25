# ==========================================
# TEST - SMART ROOM ADVICE ENGINE
# ==========================================

from advice_engine import (
    calculate_cost,
    analyze_budget,
    analyze_motion,
    analyze_voltage,
    analyze_overload,
    generate_advice
)


print("\n========================================")
print("🧪 TEST SMART FINANCIAL & ADVICE ENGINE")
print("========================================")


# ==========================================
# DONNÉES DE TEST
# ==========================================

energy_wh = 650
price_per_kwh = 0.300

financial_goal = 0.15

motion_detected = False

voltage = 260

current = 9


print("\n📥 DONNÉES DE TEST")

print(f"Consommation : {energy_wh} Wh")
print(f"Prix électricité : {price_per_kwh} TND/kWh")
print(f"Objectif financier : {financial_goal} TND")
print(f"Mouvement détecté : {motion_detected}")
print(f"Tension : {voltage} V")
print(f"Courant : {current} A")


# ==========================================
# 1. CALCUL DU COÛT
# ==========================================

cost = calculate_cost(
    energy_wh,
    price_per_kwh
)

print("\n💰 COÛT ÉNERGÉTIQUE")

print(f"Coût estimé : {cost} TND")


# ==========================================
# 2. ANALYSE DU BUDGET
# ==========================================

budget_analysis = analyze_budget(
    cost,
    financial_goal
)

print("\n🎯 ANALYSE FINANCIÈRE")

for key, value in budget_analysis.items():
    print(f"{key} : {value}")


# ==========================================
# 3. ANALYSE DU MOUVEMENT
# ==========================================

motion_analysis = analyze_motion(
    motion_detected
)

print("\n🚶 ANALYSE DE PRÉSENCE")

for key, value in motion_analysis.items():
    print(f"{key} : {value}")


# ==========================================
# 4. ANALYSE DE LA TENSION
# ==========================================

voltage_analysis = analyze_voltage(
    voltage
)

print("\n⚡ ANALYSE DE LA TENSION")

for key, value in voltage_analysis.items():
    print(f"{key} : {value}")


# ==========================================
# 5. ANALYSE DE LA SURCHARGE
# ==========================================

overload_analysis = analyze_overload(
    current
)

print("\n🔥 ANALYSE DE LA CHARGE")

for key, value in overload_analysis.items():
    print(f"{key} : {value}")


# ==========================================
# 6. GÉNÉRATION DES CONSEILS
# ==========================================

advice = generate_advice(
    energy_wh,
    budget_analysis,
    motion_analysis,
    voltage_analysis,
    overload_analysis
)

print("\n========================================")
print("💡 CONSEILS INTELLIGENTS")
print("========================================")

for index, item in enumerate(advice, start=1):
    print(f"{index}. {item}")


print("\n🎉 TEST TERMINÉ AVEC SUCCÈS !")

