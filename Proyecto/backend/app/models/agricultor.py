from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class Agricultor(Base):
    __tablename__ = "agricultores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)

    # Relación con las parcelas
    parcelas = relationship("Parcela", back_populates="agricultor")
