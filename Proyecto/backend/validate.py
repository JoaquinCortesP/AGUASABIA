#!/usr/bin/env python
"""Script de validación del proyecto AguaSabia Backend"""

import sys
from pathlib import Path

def validate_imports():
    """Validar que todos los imports funcionan"""
    try:
        from app.models.region import Region
        from app.models.comuna import Comuna
        from app.models.agricultor import Agricultor
        from app.models.parcela import Parcela
        from app.models.balance import BalanceHidrico
        from app.db.base import Base
        from app.core.config import settings
        
        print("✓ Imports de modelos: OK")
        print(f"✓ Tablas detectadas: {len(Base.metadata.tables)}")
        for table_name in sorted(Base.metadata.tables.keys()):
            print(f"  - {table_name}")
        return True
    except Exception as e:
        print(f"✗ Error en imports: {e}")
        return False

def validate_config():
    """Validar configuración"""
    try:
        from app.core.config import settings
        
        print("\n✓ Configuración:")
        print(f"  - PROJECT_NAME: {settings.PROJECT_NAME}")
        print(f"  - API_V1_STR: {settings.API_V1_STR}")
        print(f"  - DATABASE_URL: {settings.DATABASE_URL[:40]}...")
        print(f"  - REDIS_URL: {settings.REDIS_URL}")
        return True
    except Exception as e:
        print(f"✗ Error en configuración: {e}")
        return False

def validate_alembic():
    """Validar configuración de Alembic"""
    try:
        alembic_dir = Path("alembic")
        alembic_ini = Path("alembic.ini")
        
        if alembic_dir.exists() and alembic_ini.exists():
            versions = list(alembic_dir.glob("versions/*.py"))
            print(f"\n✓ Alembic configurado")
            print(f"  - Versiones: {len([v for v in versions if not '__pycache__' in str(v)])}")
            return True
        else:
            print("\n✗ Alembic no configurado correctamente")
            return False
    except Exception as e:
        print(f"✗ Error en Alembic: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("VALIDACIÓN DEL PROYECTO AGUASABIA BACKEND")
    print("=" * 60)
    
    results = []
    results.append(validate_imports())
    results.append(validate_config())
    results.append(validate_alembic())
    
    print("\n" + "=" * 60)
    if all(results):
        print("✓ Validación completa: TODO OK")
        sys.exit(0)
    else:
        print("✗ Validación incompleta: REVISAR ERRORES")
        sys.exit(1)
