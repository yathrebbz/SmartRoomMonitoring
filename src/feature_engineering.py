import pandas as pd

print("=" * 50)
print("FEATURE ENGINEERING")
print("=" * 50)

# Charger le dataset prétraité
df = pd.read_csv("data/processed_data.csv")

# Conversion de la colonne date
df["date"] = pd.to_datetime(df["date"])

# Extraction des informations temporelles
df["hour"] = df["date"].dt.hour
df["day"] = df["date"].dt.day
df["month"] = df["date"].dt.month
df["day_of_week"] = df["date"].dt.dayofweek

print("\nNouvelles variables créées :")
print("- hour")
print("- day")
print("- month")
print("- day_of_week")

# Supprimer la colonne date originale
df = df.drop(columns=["date"])

# Sauvegarder le nouveau dataset
df.to_csv("data/features_data.csv", index=False)

print("\nFeature engineering terminé avec succès !")
print("Dataset sauvegardé dans : data/features_data.csv")
print("Nouvelle dimension :", df.shape)
