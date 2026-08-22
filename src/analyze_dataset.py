import pandas as pd

# ==============================
# 1. Chargement du dataset
# ==============================

file_path = "data/energydata_complete.csv"

df = pd.read_csv(file_path)

print("=" * 60)
print("ANALYSE DU DATASET ENERGY")
print("=" * 60)

# ==============================
# 2. Dimensions
# ==============================

print("\n[1] Dimensions du dataset")
print("Nombre de lignes :", df.shape[0])
print("Nombre de colonnes :", df.shape[1])

# ==============================
# 3. Colonnes
# ==============================

print("\n[2] Colonnes disponibles")
for i, column in enumerate(df.columns, start=1):
    print(f"{i}. {column}")

# ==============================
# 4. Types de données
# ==============================

print("\n[3] Types de données")
print(df.dtypes)

# ==============================
# 5. Valeurs manquantes
# ==============================



print("\n[4] Valeurs manquantes")
missing = df.isnull().sum()

print(missing)

print("\nNombre total de valeurs manquantes :", missing.sum())

# ==============================
# 6. Informations statistiques
# ==============================

print("\n[5] Statistiques descriptives")
print(df.describe())

# ==============================
# 7. Données temporelles
# ==============================

print("\n[6] Informations temporelles")

df["date"] = pd.to_datetime(df["date"])

print("Première date :", df["date"].min())
print("Dernière date :", df["date"].max())

# ==============================
# 8. Consommation énergétique
# ==============================

print("\n[7] Analyse de la consommation")

print("Consommation Appliances moyenne :",
      df["Appliances"].mean())

print("Consommation Appliances minimale :",
      df["Appliances"].min())

print("Consommation Appliances maximale :",
      df["Appliances"].max())

print("Consommation Lights moyenne :",
      df["lights"].mean())

print("Consommation Lights maximale :",
      df["lights"].max())

# ==============================
# 9. Premières lignes
# ==============================

print("Consommation Lights moyenne :",
 df["lights"].mean())

print("\n[8] Aperçu du dataset")
print(df.head())

print("\n" + "=" * 60)
print("ANALYSE TERMINÉE")
print("=" * 60)

