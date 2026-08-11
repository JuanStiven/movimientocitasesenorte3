from database import SessionLocal
import models
from core.security import get_password_hash

def init_admin():
    db = SessionLocal()
    admin_user = db.query(models.Usuario).filter(models.Usuario.username == "admin").first()
    if not admin_user:
        hashed_password = get_password_hash("admin123")
        admin_user = models.Usuario(
            username="admin",
            password_hash=hashed_password,
            nombre_completo="Administrador del Sistema",
            rol="ADMIN",
            activo=True
        )
        db.add(admin_user)
        db.commit()
        print("Usuario administrador creado por defecto. (admin / admin123)")
    else:
        print("Usuario administrador ya existe.")
    db.close()

if __name__ == "__main__":
    init_admin()
