import joblib
import pandas as pd

print("=" * 60)
print("FEATURE IMPORTANCE ANALYSIS")
print("=" * 60)

# Charger le modèle entraîné
model = joblib.load("models/random_forest_model.pkl")

# Récupérer les noms des variables
features = model.feature_names_in_

# Récupérer leur importance
importance = model.feature_importances_

# Créer un tableau
df_importance = pd.DataFrame({
    "Feature": features,
    "Importance": importance
})

# Trier de la plus importante à la moins importante
df_importance = df_importance.sort_values(
    by="Importance",
    ascending=False
)

print("\nIMPORTANCE DES VARIABLES :\n")
print(df_importance.to_string(index=False))

# Afficher les 10 variables les plus importantes
print("\n" + "=" * 60)
print("TOP 10 MOST IMPORTANT FEATURES")
print("=" * 60)

print(df_importance.head(10).to_string(index=False))

# Sauvegarder le résultat
df_importance.to_csv(
    "results/feature_importance.csv",
    index=False
)

print("\nRésultat sauvegardé dans :")
print("results/feature_importance.csv")
