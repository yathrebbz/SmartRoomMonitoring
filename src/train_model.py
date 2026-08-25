import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==========================================
# 1. CHARGEMENT DU DATASET
# ==========================================

print("\n📂 Chargement du dataset...")

df = pd.read_csv(
    "data/processed/smart_room_dataset.csv"
)

print("Dataset chargé avec succès !")

print("\nDimensions du dataset :")
print(df.shape)


# ==========================================
# 2. VARIABLES D'ENTRÉE ET CIBLE
# ==========================================

features = [
    "hour",
    "temperature",
    "humidity",
    "light_level",
    "pressure",
    "outdoor_temperature",
    "dewpoint"
]

target = "energy_consumption"

X = df[features]
y = df[target]

print("\nVariables utilisées :")

for feature in features:
    print("-", feature)

print("\nVariable à prédire :")
print(target)


# ==========================================
# 3. SÉPARATION TRAIN / TEST
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("\n📊 Données d'entraînement :", X_train.shape)
print("📊 Données de test :", X_test.shape)


# ==========================================
# 4. CRÉATION DU MODÈLE RANDOM FOREST
# ==========================================

print("\n🤖 Entraînement du modèle Random Forest...")

model = RandomForestRegressor(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

print("✅ Entraînement terminé !")


# ==========================================
# 5. PRÉDICTION
# ==========================================

y_pred = model.predict(X_test)


# ==========================================
# 6. ÉVALUATION DU MODÈLE
# ==========================================

mae = mean_absolute_error(
    y_test,
    y_pred
)

rmse = mean_squared_error(
    y_test,
    y_pred
) ** 0.5

r2 = r2_score(
    y_test,
    y_pred
)

print("\n==============================")
print("📈 PERFORMANCE DU MODÈLE")
print("==============================")

print(f"MAE  : {mae:.2f} Wh")
print(f"RMSE : {rmse:.2f} Wh")
print(f"R²   : {r2:.4f}")


# ==========================================
# 7. IMPORTANCE DES VARIABLES
# ==========================================

importance_df = pd.DataFrame({
    "feature": features,
    "importance": model.feature_importances_
})

importance_df = importance_df.sort_values(
    by="importance",
    ascending=False
)

print("\n==============================")
print("🔍 IMPORTANCE DES VARIABLES")
print("==============================")

print(importance_df)


# ==========================================
# 8. SAUVEGARDE DU MODÈLE
# ==========================================

joblib.dump(
    model,
    "models/smart_room_energy_model.pkl"
)

joblib.dump(
    features,
    "models/model_features.pkl"
)

print("\n💾 Modèle sauvegardé :")
print("models/smart_room_energy_model.pkl")

print("\n💾 Variables sauvegardées :")
print("models/model_features.pkl")

print("\n🎉 MODÈLE PRÊT POUR FLASK !")
