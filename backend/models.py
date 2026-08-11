from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(250), nullable=False)
    nombre_completo = Column(String(200), nullable=True)
    rol = Column(String(50), default="ADMIN", nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Paciente(Base):
    __tablename__ = "pacientes"

    identificacion = Column(String(50), primary_key=True, index=True)
    nombrecompleto = Column(String(255), nullable=False, index=True)
    fechanacimiento = Column(Date, nullable=True)
    sexopaciente = Column(String(20), nullable=True)
    telefonomovil = Column(String(50), nullable=True)

    citas = relationship("Cita", back_populates="paciente")


class Medico(Base):
    __tablename__ = "medicos"

    identificacionmedico = Column(String(50), primary_key=True, index=True)
    mediconombre = Column(String(255), nullable=False, index=True)

    citas = relationship("Cita", back_populates="medico")


class Especialidad(Base):
    __tablename__ = "especialidades"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), unique=True, nullable=False, index=True)

    citas = relationship("Cita", back_populates="especialidad")


class Sede(Base):
    __tablename__ = "sedes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), unique=True, nullable=False, index=True)

    citas = relationship("Cita", back_populates="sede")


class Convenio(Base):
    __tablename__ = "convenios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), unique=True, nullable=False, index=True)
    es_ebs = Column(Boolean, default=False, index=True)

    citas = relationship("Cita", back_populates="convenio")


class Programa(Base):
    __tablename__ = "programas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), unique=True, nullable=False, index=True)

    citas = relationship("Cita", back_populates="programa")


class Cita(Base):
    __tablename__ = "citas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    agendacita_id = Column(String(100), unique=True, index=True, nullable=False)
    fechacita = Column(DateTime, nullable=True, index=True)
    horacita = Column(String(50), nullable=True)
    fechadeseada = Column(Date, nullable=True, index=True)
    fechaasignacion = Column(Date, nullable=True, index=True)
    fechaatencion = Column(DateTime, nullable=True, index=True)

    estado_cita = Column(String(100), nullable=False, index=True)
    estado_consulta = Column(String(100), nullable=False, index=True)
    tipocita = Column(String(100), nullable=True, index=True)
    finalidad = Column(String(255), nullable=True)

    dias_en_sala = Column(Integer, default=0)
    alerta_sala = Column(Boolean, default=False, index=True)
    dias_espera = Column(Float, default=0.0)

    paciente_id = Column(String(50), ForeignKey("pacientes.identificacion"), nullable=True)
    medico_id = Column(String(50), ForeignKey("medicos.identificacionmedico"), nullable=True)
    especialidad_id = Column(Integer, ForeignKey("especialidades.id"), nullable=True)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=True)
    convenio_id = Column(Integer, ForeignKey("convenios.id"), nullable=True)
    programa_id = Column(Integer, ForeignKey("programas.id"), nullable=True)

    paciente = relationship("Paciente", back_populates="citas")
    medico = relationship("Medico", back_populates="citas")
    especialidad = relationship("Especialidad", back_populates="citas")
    sede = relationship("Sede", back_populates="citas")
    convenio = relationship("Convenio", back_populates="citas")
    programa = relationship("Programa", back_populates="citas")
