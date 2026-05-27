import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.administrador import Administrador
from app.models.region import Region
from app.models.comuna import Comuna
from app.models.municipio import Municipio

def seed_db():
    db = SessionLocal()
    
    # Datos proporcionados para inicializar
    data = {
        "Atacama": [
            ("Copiapó", "Escasez hídrica"),
            ("Caldera", "Escasez hídrica"),
            ("Tierra Amarilla", "Escasez hídrica")
        ],
        "Coquimbo": [
            ("Andacollo", "Escasez hídrica"),
            ("Canela", "Escasez hídrica"),
            ("Combarbalá", "Escasez hídrica"),
            ("Coquimbo", "Escasez hídrica"),
            ("Illapel", "Escasez hídrica"),
            ("La Higuera", "Escasez hídrica"),
            ("La Serena", "Escasez hídrica"),
            ("Los Vilos", "Escasez hídrica"),
            ("Monte Patria", "Escasez hídrica"),
            ("Ovalle", "Escasez hídrica"),
            ("Paihuano", "Escasez hídrica"),
            ("Punitaqui", "Escasez hídrica"),
            ("Río Hurtado", "Escasez hídrica"),
            ("Salamanca", "Escasez hídrica"),
            ("Vicuña", "Escasez hídrica")
        ],
        "Valparaíso": [
            ("Algarrobo", "Escasez hídrica"),
            ("Cabildo", "Escasez hídrica"),
            ("Calle Larga", "Escasez hídrica"),
            ("Cartagena", "Escasez hídrica"),
            ("Casablanca", "Escasez hídrica"),
            ("Catemu", "Escasez hídrica"),
            ("Concón", "Escasez hídrica"),
            ("El Quisco", "Escasez hídrica"),
            ("El Tabo", "Escasez hídrica"),
            ("Hijuelas", "Escasez hídrica"),
            ("Juan Fernández", "Escasez hídrica"),
            ("La Calera", "Escasez hídrica"),
            ("La Cruz", "Escasez hídrica"),
            ("La Ligua", "Escasez hídrica"),
            ("Limache", "Escasez hídrica"),
            ("Llay-Llay", "Escasez hídrica"),
            ("Los Andes", "Escasez hídrica"),
            ("Nogales", "Escasez hídrica"),
            ("Olmué", "Escasez hídrica"),
            ("Panquehue", "Escasez hídrica"),
            ("Papudo", "Escasez hídrica"),
            ("Petorca", "Escasez hídrica severa"),
            ("Puchuncaví", "Problemas de gestión hídrica"),
            ("Putaendo", "Escasez hídrica"),
            ("Quillota", "Escasez hídrica"),
            ("Quilpué", "Escasez hídrica"),
            ("Quintero", "Problemas de gestión hídrica"),
            ("Rinconada", "Escasez hídrica"),
            ("San Antonio", "Escasez hídrica"),
            ("San Esteban", "Escasez hídrica"),
            ("San Felipe", "Escasez hídrica"),
            ("Santa María", "Escasez hídrica"),
            ("Santo Domingo", "Escasez hídrica"),
            ("Valparaíso", "Estrés hídrico urbano"),
            ("Villa Alemana", "Escasez hídrica"),
            ("Viña del Mar", "Estrés hídrico urbano"),
            ("Zapallar", "Escasez hídrica")
        ],
        "Metropolitana": [
            ("Buin", "Escasez hídrica"),
            ("Calera de Tango", "Escasez hídrica"),
            ("Colina", "Escasez hídrica"),
            ("Curacaví", "Escasez hídrica"),
            ("El Monte", "Escasez hídrica"),
            ("Isla de Maipo", "Escasez hídrica"),
            ("Lampa", "Escasez hídrica"),
            ("Las Condes", "Estrés hídrico urbano"),
            ("Lo Barnechea", "Estrés hídrico urbano"),
            ("María Pinto", "Escasez hídrica"),
            ("Melipilla", "Escasez hídrica severa"),
            ("Padre Hurtado", "Escasez hídrica"),
            ("Paine", "Escasez hídrica"),
            ("Peñaflor", "Escasez hídrica"),
            ("Pirque", "Escasez hídrica"),
            ("Pudahuel", "Problemas de gestión hídrica"),
            ("Puente Alto", "Estrés hídrico urbano"),
            ("San Bernardo", "Escasez hídrica"),
            ("San José de Maipo", "Escasez hídrica"),
            ("San Pedro", "Escasez hídrica severa"),
            ("Talagante", "Escasez hídrica"),
            ("Tiltil", "Escasez hídrica"),
            ("Vitacura", "Estrés hídrico urbano")
        ],
        "O’Higgins": [
            ("Pichilemu", "Escasez hídrica"),
            ("Navidad", "Escasez hídrica"),
            ("Placilla", "Problemas de gestión hídrica agrícola"),
            ("Rengo", "Estrés hídrico agrícola")
        ],
        "Maule": [
            ("Curicó", "Estrés hídrico agrícola"),
            ("Linares", "Estrés hídrico agrícola"),
            ("Cauquenes", "Escasez hídrica"),
            ("Parral", "Problemas de gestión hídrica")
        ],
        "Los Lagos": [
            ("Ancud", "Escasez hídrica"),
            ("Calbuco", "Escasez hídrica"),
            ("Castro", "Escasez hídrica"),
            ("Chonchi", "Escasez hídrica"),
            ("Cochamó", "Escasez hídrica"),
            ("Curaco de Vélez", "Escasez hídrica"),
            ("Dalcahue", "Escasez hídrica"),
            ("Fresia", "Escasez hídrica"),
            ("Frutillar", "Escasez hídrica"),
            ("Llanquihue", "Escasez hídrica"),
            ("Los Muermos", "Escasez hídrica"),
            ("Maullín", "Escasez hídrica"),
            ("Osorno", "Escasez hídrica"),
            ("Puerto Montt", "Escasez hídrica"),
            ("Puerto Octay", "Escasez hídrica"),
            ("Puerto Varas", "Escasez hídrica"),
            ("Puqueldón", "Escasez hídrica"),
            ("Purranque", "Escasez hídrica"),
            ("Puyehue", "Escasez hídrica"),
            ("Queilén", "Escasez hídrica"),
            ("Quellón", "Escasez hídrica"),
            ("Quemchi", "Escasez hídrica"),
            ("Quinchao", "Escasez hídrica"),
            ("Río Negro", "Escasez hídrica"),
            ("San Juan de la Costa", "Escasez hídrica"),
            ("San Pablo", "Escasez hídrica")
        ]
    }
    
    # Insertar regiones y comunas
    for region_name, comunas_list in data.items():
        # Verificamos si la región ya existe
        region = db.query(Region).filter_by(nombre=region_name).first()
        if not region:
            region = Region(nombre=region_name)
            db.add(region)
            db.commit()
            db.refresh(region)
            
        for comuna_name, situacion in comunas_list:
            comuna = db.query(Comuna).filter_by(nombre=comuna_name, region_id=region.id).first()
            if not comuna:
                comuna = Comuna(nombre=comuna_name, region_id=region.id, situacion=situacion)
                db.add(comuna)
                
    db.commit()

    for comuna in db.query(Comuna).all():
        municipio = db.query(Municipio).filter_by(comuna_id=comuna.id).first()
        if not municipio:
            municipio = Municipio(
                nombre=f"Municipalidad de {comuna.nombre}",
                region_id=comuna.region_id,
                comuna_id=comuna.id,
            )
            db.add(municipio)

    db.commit()

    demo_municipio = db.query(Municipio).order_by(Municipio.id).first()
    if demo_municipio:
        demo_admin = db.query(Administrador).filter_by(email="admin@aguasabia.cl").first()
        legacy_admin = db.query(Administrador).filter_by(email="admin@aguasabia.local").first()
        if legacy_admin and not demo_admin:
            legacy_admin.email = "admin@aguasabia.cl"
            legacy_admin.municipio_id = demo_municipio.id
            legacy_admin.is_active = True
            demo_admin = legacy_admin
        if not demo_admin:
            demo_admin = Administrador(
                nombre="Admin AguaSabia",
                email="admin@aguasabia.cl",
                hashed_password=get_password_hash("admin123"),
                municipio_id=demo_municipio.id,
                is_active=True,
            )
            db.add(demo_admin)
        db.commit()

    db.close()
    print("Base de datos inicializada correctamente.")

if __name__ == "__main__":
    seed_db()
