from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
from core.security import get_current_user, get_password_hash

router = APIRouter(prefix="/api/users", tags=["users"])

def require_admin(current_user: models.Usuario = Depends(get_current_user)):
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="No tiene permisos de administrador")
    return current_user

@router.get("", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db), current_user: models.Usuario = Depends(require_admin)):
    users = db.query(models.Usuario).order_by(models.Usuario.id).all()
    return users

@router.post("", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(require_admin)):
    existing = db.query(models.Usuario).filter(models.Usuario.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.Usuario(
        username=user.username,
        password_hash=hashed_password,
        nombre_completo=user.nombre_completo,
        rol=user.rol,
        activo=user.activo
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(require_admin)):
    db_user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user.username and user.username != db_user.username:
        existing = db.query(models.Usuario).filter(models.Usuario.username == user.username).first()
        if existing:
            raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
        db_user.username = user.username

    if user.nombre_completo is not None:
        db_user.nombre_completo = user.nombre_completo
    if user.rol is not None:
        db_user.rol = user.rol
    if user.activo is not None:
        db_user.activo = user.activo
    if user.password:
        db_user.password_hash = get_password_hash(user.password)

    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(require_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")
    db_user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(db_user)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}
