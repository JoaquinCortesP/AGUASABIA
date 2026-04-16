from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Municipio(Base):
    __tablename__ = "municipios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    region = Column(String)
