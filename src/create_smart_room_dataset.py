import pandas as pd

# Charger le dataset original
df = pd.read_csv("data/energydata_complete.csv")

# Convertir la date
df["date"] = pd.to_datetime(df["date"])

# Créer la variable heure
df["hour"] = df["date"].dt.hour

# Sélectionner les variables importantes
smart_df = df[
    [
        "hour",
        "T3",
        "RH_3",
        "lights",
        "Press_mm_hg",
        "T_out",
        "Tdewpoint",
        "Appliances"
    ]
].copy()

# Renommer les colonnes pour notre Smart Room
smart_df.rename(
    columns={
        "T3": "temperature",
        "RH_3": "humidity",
        "lights": "light_level",
        "Press_mm_hg": "pressure",
        "T_out": "outdoor_temperature",
        "Tdewpoint": "dewpoint",
        "Appliances": "energy_consumption"
    },
    inplace=True
)

# Sauvegarder le nouveau dataset
output_file = "data/processed/smart_room_dataset.csv"

smart_df.to_csv(output_file, index=False)

print("Dataset créé avec succès !")
print(f"Fichier : {output_file}")

print("\nColonnes :")
print(smart_df.columns.tolist())

print("\nDimensions :")
print(smart_df.shape)

print("\nPremières lignes :")
print(smart_df.head())
