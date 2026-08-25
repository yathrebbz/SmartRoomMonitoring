"""Lance le serveur de développement : ``python -m backend``.

Variables d'environnement : HOST (défaut 0.0.0.0), PORT (défaut 8000),
RELOAD=1 pour recharger automatiquement à chaque modification du code,
CORS_ORIGINS pour autoriser d'autres origines que le serveur Vite local.
Documentation interactive de l'API : http://localhost:8000/docs
"""

import os

import uvicorn

uvicorn.run(
    "backend.main:create_app",
    factory=True,
    host=os.environ.get("HOST", "0.0.0.0"),
    port=int(os.environ.get("PORT", "8000")),
    reload=os.environ.get("RELOAD", "0") == "1",
)
