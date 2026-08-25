# 🏠 Smart Room AI

Supervision énergétique intelligente d'une pièce : un modèle Random Forest
prédit la consommation électrique à partir des capteurs, et l'application en
déduit le coût, le respect d'un objectif financier, la sécurité électrique
(tension, surcharge, présence) et des conseils.

Le projet est composé de trois parties indépendantes :

| Partie | Technologie | Rôle |
| --- | --- | --- |
| [`notebooks/`](notebooks/) | Jupyter (CRISP-DM) | Exploration, préparation, modélisation, évaluation, export du modèle |
| [`backend/`](backend/) | FastAPI | API REST : prédiction, profil 24 h, référence, configuration |
| [`frontend/`](frontend/) | React + Vite + Tailwind | Tableau de bord interactif |

Le modèle est entraîné sur le dataset public UCI
[Appliances energy prediction](https://archive.ics.uci.edu/dataset/374/appliances+energy+prediction)
(19 735 relevés toutes les 10 minutes, janvier–mai 2016).

## Structure du projet

```
SmartRoomMonitoring/
├── backend/                    # API FastAPI (architecture en couches)
│   ├── main.py                 #   create_app() : CORS, chargement du modèle et de la référence
│   ├── __main__.py             #   python -m backend  (uvicorn, port 8000)
│   ├── core/config.py          #   chemins, seuils, valeurs par défaut, CORS
│   ├── api/                    #   couche HTTP
│   │   ├── deps.py             #     dépendances injectées (modèle → 503 s'il est absent, référence)
│   │   └── routes/             #     un routeur par domaine
│   │       ├── system.py       #       GET /api/health · GET /api/config
│   │       ├── analysis.py     #       POST /api/predict · POST /api/profile
│   │       └── reference.py    #       GET /api/reference/hourly
│   ├── schemas/                #   modèles Pydantic (validation + documentation OpenAPI)
│   │   ├── analysis.py · reference.py · system.py
│   ├── services/               #   logique métier, indépendante de FastAPI
│   │   ├── advice_engine.py    #     règles : coût, budget, présence, tension, surcharge, conseils
│   │   ├── analysis.py         #     cas d'usage : analyse d'un relevé, profil 24 h
│   │   └── reference.py        #     profil horaire de référence calculé sur le dataset
│   └── ml/model.py             #   EnergyModel : chargement du modèle exporté + prédiction
├── frontend/                   # Application React (Vite + TypeScript + Tailwind + Recharts)
│   ├── index.html
│   ├── vite.config.ts          #   proxy /api → http://127.0.0.1:8000
│   └── src/
│       ├── api/                #   client HTTP + types miroir des schémas
│       ├── hooks/              #   useSmartRoom (état, analyse auto, historique), useTheme
│       ├── lib/                #   champs des capteurs, préréglages, formatage fr-FR, statuts
│       └── components/         #   TopBar, panneau capteurs, KPI, profil 24 h, jauges, conseils, historique
├── notebooks/
│   └── smart_room_modeling.ipynb   # Modélisation CRISP-DM (exécuté, avec sorties)
├── data/
│   ├── energydata_complete.csv     # Dataset UCI original
│   └── appliances+energy+prediction.zip
├── models/                     # Modèle exporté par le notebook (.pkl, ignoré par git)
├── tests/                      # Tests pytest du backend (helpers.py : modèle factice, client de test)
├── requirements.txt            # Dépendances Python (backend + notebook + tests)
└── pyproject.toml              # Configuration pytest
```

## 1. Installation

### Python (backend, notebook, tests)

```bash
python -m venv venv
venv\Scripts\activate          # Windows  (source venv/bin/activate sous Linux/macOS)
pip install -r requirements.txt
```

### Node.js (frontend)

```bash
cd frontend
npm install
```

## 2. Modélisation (notebook)

Tout le travail de données et de machine learning est dans
[`notebooks/smart_room_modeling.ipynb`](notebooks/smart_room_modeling.ipynb),
organisé selon la méthodologie **CRISP-DM** :

1. **Business Understanding** — objectifs, contraintes (7 capteurs, modèle ≤ 20 Mo), critères de succès
2. **Data Understanding** — qualité, distribution de la cible, profils horaires, corrélations
3. **Data Preparation** — nettoyage, variables temporelles, sélection des 7 variables Smart Room
4. **Modeling** — baselines, Random Forest complet, Random Forest Smart Room (réglage par score OOB sous budget de taille)
5. **Evaluation** — métriques, importance des variables, analyse des erreurs, validation croisée, lecture métier

La dernière cellule exporte le modèle utilisé par le backend (joblib compressé, ~18 Mo) :
`models/smart_room_energy_model.pkl` et `models/model_features.pkl`.

```bash
jupyter notebook notebooks/smart_room_modeling.ipynb
# ou, sans interface :
jupyter nbconvert --to notebook --execute --inplace notebooks/smart_room_modeling.ipynb
```

Variables d'entrée du modèle : `hour`, `temperature` (T3), `humidity` (RH_3),
`light_level` (lights), `pressure` (Press_mm_hg), `outdoor_temperature`
(T_out), `dewpoint` (Tdewpoint). Cible : `Appliances` (Wh sur 10 minutes).

## 3. Lancer l'application

Deux terminaux :

```bash
# Terminal 1 — API (http://localhost:8000, documentation sur /docs)
python -m backend

# Terminal 2 — tableau de bord (http://localhost:5173)
cd frontend
npm run dev
```

Le serveur Vite relaie `/api` vers le backend : aucune configuration CORS n'est
nécessaire en développement. Pour cibler une autre adresse d'API :
`VITE_API_URL=http://192.168.1.10:8000 npm run dev`.

Variables d'environnement du backend : `HOST` (défaut `0.0.0.0`), `PORT`
(défaut `8000`), `RELOAD=1` pour le rechargement automatique.

Si le modèle n'a pas encore été exporté, l'API démarre quand même : le tableau
de bord affiche « Modèle non chargé » et `/api/predict` répond `503`.

### Build de production du frontend

```bash
cd frontend
npm run build        # type-check + bundle dans frontend/dist/
npm run preview
```

## 4. Le tableau de bord

- **Capteurs & paramètres** (panneau latéral) : curseurs + saisie pour les 7 capteurs, la
  sécurité électrique (mouvement, tension, courant, courant maximal) et les finances
  (prix, objectif). Quatre scénarios rapides (soirée, nuit, été, incident électrique).
  L'analyse se relance automatiquement à chaque modification (désactivable).
- **Indicateurs** : consommation prédite, coût du relevé, budget restant (barre de
  progression), coût estimé sur 24 h.
- **Profil sur 24 h** : consommation prédite heure par heure pour l'état actuel des
  capteurs, comparée à la médiane horaire du dataset ; vue tableau disponible.
- **Tension / Charge / Présence** : jauge 180–280 V avec plage normale, barre de charge
  avec seuil d'alerte à 80 %, capteur de présence.
- **Conseils intelligents** : recommandations classées par gravité + synthèse des statuts.
- **Historique de session** : analyses conservées dans le navigateur, restaurables.
- Thème clair / sombre / système, interface responsive, `prefers-reduced-motion` respecté.

## 5. API

Documentation interactive : <http://localhost:8000/docs>.

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | État de l'API, modèle chargé, variables, référence disponible |
| `GET` | `/api/config` | Valeurs par défaut et seuils (pour afficher les mêmes limites que l'API) |
| `POST` | `/api/predict` | Analyse complète d'un relevé |
| `POST` | `/api/profile` | Consommation prédite pour chaque heure (capteurs constants) |
| `GET` | `/api/reference/hourly` | Moyenne / médiane / P90 par heure du dataset d'origine |

### `POST /api/predict`

| Champ | Obligatoire | Défaut | Description |
| --- | --- | --- | --- |
| `hour` (0–23), `temperature`, `humidity` (0–100), `light_level` (≥ 0), `pressure` (> 0), `outdoor_temperature`, `dewpoint` | oui | – | Variables du modèle |
| `electricity_price` | non | `0.3` | Prix en TND/kWh |
| `financial_goal` | non | `0.15` | Objectif par relevé en TND |
| `movement` | non | `false` | Mouvement détecté |
| `voltage` | non | `230` | Tension en V |
| `current` | non | `0` | Courant en A |
| `max_current` | non | `10` | Courant maximal admissible en A (> 0) |

```json
{
  "prediction": 214.0,
  "cost": 0.064,
  "financial": { "goal": 0.15, "remaining_budget": 0.086, "status": "good", "message": "..." },
  "movement":  { "detected": false, "status": "empty", "message": "..." },
  "voltage":   { "value": 230.0, "status": "normal", "message": "..." },
  "load":      { "current": 5.0, "max_current": 10.0, "status": "normal", "message": "..." },
  "advice":    [{ "level": "info", "text": "Tout fonctionne normalement. Continuez ainsi !" }]
}
```

Statuts : `financial` → `good` / `warning` / `budget_exceeded` ; `movement` →
`occupied` / `empty` ; `voltage` → `normal` / `overvoltage` / `undervoltage` ;
`load` → `normal` / `warning` / `overload` ; `advice[].level` → `info` /
`warning` / `critical`. Les seuils sont dans [`backend/core/config.py`](backend/core/config.py).

### Ajouter une fonctionnalité au backend

1. **Schéma** : les modèles d'entrée/sortie dans `backend/schemas/<domaine>.py`.
2. **Service** : la logique dans `backend/services/<domaine>.py` (fonctions pures, testables sans HTTP).
3. **Route** : un routeur fin dans `backend/api/routes/<domaine>.py`, enregistré dans `backend/api/__init__.py`.
4. **Test** : `tests/test_api_<domaine>.py` avec le client factice de `tests/helpers.py`.

Erreurs : `422` (validation, détail par champ), `503` (modèle non chargé).

## 6. Tests

```bash
pytest                       # backend (40 tests)
cd frontend && npm run typecheck
```
