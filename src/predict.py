import pandas as pd
import joblib

print("=" * 50)
print("ENERGY CONSUMPTION PREDICTION")
print("=" * 50)

# Charger le modèle
model = joblib.load("models/random_forest_model.pkl")

# Charger les données
df = pd.read_csv("data/features_data.csv")

# Séparer la variable cible
y = df["Appliances"]

# Préparer les variables d'entrée
X = df.drop(columns=["Appliances", "date"], errors="ignore")

# Choisir une observation à tester
index = 0

sample = X.iloc[[index]]

# Valeur réelle
real_value = y.iloc[index]

# Prédiction
prediction = model.predict(sample)[0]

# Calcul de l'erreur
error = abs(real_value - prediction)

print("\nDonnées utilisées :")
print(sample)

print("\n" + "=" * 50)
print("RESULTATS")
print("=" * 50)

print(f"\n⚡ Consommation réelle   : {real_value:.2f} Wh")
print(f"🤖 Consommation prédite : {prediction:.2f} Wh")
print(f"📉 Erreur absolue       : {error:.2f} Wh")

print("\nPREDICTION ET COMPARAISON TERMINEES AVEC SUCCES !")
