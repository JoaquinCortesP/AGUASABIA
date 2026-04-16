from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base

class Agricultor(Base):
    __tablename__ = "agricultores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    municipio_id = Column(Integer, ForeignKey("municipios.id"))
