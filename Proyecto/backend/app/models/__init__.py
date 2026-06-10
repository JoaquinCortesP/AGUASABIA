# Archivo para importar todos los modelos para Alembic
from app.db.base import Base
from app.models.region import Region
from app.models.comuna import Comuna
from app.models.municipio import Municipio
from app.models.administrador import Administrador
from app.models.usuario import Usuario
from app.models.consulta_territorial import ConsultaTerritorial, ResultadoConsultaModulo
from app.models.capas_ambientales import (
    Cuenca,
    Subcuenca,
    DecretoEscasez,
    EventoIncendio,
    FuenteHidrica,
    IndicadorClimatico,
    IndicadorVegetacion,
    IndiceSequia,
)
from app.models.agricultor import Agricultor
from app.models.parcela import Parcela
from app.models.balance_hidrico import BalanceHidrico
