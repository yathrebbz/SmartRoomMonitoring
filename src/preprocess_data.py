import pandas as pd
import os

# Chemin du dataset original
input_file = "data/energydata_complete.csv"

# Chemin du dataset prétraité
output_file = "data/processed_data.csv"

print("===================================")
print("DATA PREPROCESSING")
print("===================================")

# Chargement du dataset
df = pd.read_csv(input_file)

print(f"\nDataset chargé : {df.shape[0]} lignes, {df.shape[1]} colonnes")

# Conversion de la colonne date
df["date"] = pd.to_datetime(df["date"])

# Vérification des valeurs manquantes
missing_values = df.isnull().sum().sum()
print(f"Valeurs manquantes : {missing_values}")

# Suppression des éventuels doublons
duplicates = df.duplicated().sum()
print(f"Doublons trouvés : {duplicates}")

if duplicates > 0:
    df = df.drop_duplicates()

# Création de nouvelles caractéristiques temporelles
df["hour"] = df["date"].dt.hour
df["day"] = df["date"].dt.day
df["month"] = df["date"].dt.month
df["day_of_week"] = df["date"].dt.dayofweek

# Sauvegarde du dataset prétraité
df.to_csv(output_file, index=False)

print("\nPrétraitement terminé avec succès !")
print(f"Dataset sauvegardé dans : {output_file}")
print(f"Nouvelle dimension : {df.shape}")
