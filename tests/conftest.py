import pytest

from tests.helpers import make_client


@pytest.fixture
def client():
    """Client de test avec un modèle factice (250 Wh) et sans profil de référence."""
    return make_client()
