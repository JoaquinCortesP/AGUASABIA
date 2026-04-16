from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.db.base import Base

class Parcela(Base):
    __tablename__ = "parcelas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    latitud = Column(Float)
    longitud = Column(Float)
    area = Column(Float)
    cultivo = Column(String)
    agricultor_id = Column(Integer, ForeignKey("agricultores.id"))
