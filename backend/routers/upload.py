from fastapi import APIRouter, UploadFile, File, HTTPException
from services.data_processor import DataProcessor

router = APIRouter(prefix="/api/upload", tags=["Upload"])

# Instancia singleton compartida del DataProcessor
processor = DataProcessor()

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    """
    Endpoint para que el usuario importador cargue diariamente el insumo Excel o CSV.
    """
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls') or file.filename.endswith('.csv')):
        raise HTTPException(status_code=400, detail="Formato de archivo no soportado. Debe ser .xlsx, .xls o .csv")
    
    contents = await file.read()
    result = processor.process_file(contents, file.filename)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=f"Error al procesar archivo: {result.get('error')}")

    return {
        "success": True,
        "message": "Archivo insumo cargado e ingestado exitosamente",
        "metadata": result.get("metadata"),
        "columns": result.get("columns_found"),
        "db_import": result.get("db_import")
    }

@router.get("/info")
async def get_dataset_info():
    """
    Retorna la información del dataset actualmente cargado en memoria.
    """
    df = processor.get_dataframe()
    return {
        "metadata": processor.dataset_metadata,
        "total_records": len(df)
    }

@router.post("/reload-initial")
async def reload_initial():
    """
    Recarga el insumo inicial si existe en el sistema.
    """
    processor.auto_load_initial_file()
    return {
        "message": "Insumo inicial recargado exitosamente",
        "metadata": processor.dataset_metadata
    }
