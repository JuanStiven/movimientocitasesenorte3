'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, PlusCircle, RefreshCw as UpdateIcon } from 'lucide-react';

interface DataImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const DataImporterModal: React.FC<DataImporterModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Selecciona un archivo CSV o Excel antes de continuar.');
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUploadResult(data);
        onUploadSuccess();
      } else {
        setErrorMessage(data.error || data.detail || 'Ocurrió un error al procesar el archivo en el servidor.');
      }
    } catch (err: any) {
      setErrorMessage('No se pudo establecer conexión con el servidor backend.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden transition-colors">
        
        {/* Header del Modal */}
        <div className="p-4 bg-sidebar dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary-300" />
            <div>
              <h2 className="font-bold text-sm">IMPORTADOR DE INSUMO DIARIO</h2>
              <p className="text-[11px] text-sidebar-text">Persistencia en PostgreSQL por agendacita_id</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-5 space-y-4">
          
          {/* Explicación de la clave de deduplicación */}
          <div className="p-3 bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 rounded-xl flex items-start gap-2.5 text-xs text-primary-950 dark:text-primary-200">
            <ShieldCheck className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Deduplicación Automática Garantizada:</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                El insumo evalúa <strong>agendacita_id</strong>. Citas nuevas son creadas y citas existentes son actualizadas sin generar duplicados.
              </p>
            </div>
          </div>

          {/* Área Drag & Drop / Selección de Archivo */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-primary-500 transition-colors bg-slate-50/50 dark:bg-slate-800/40">
            <input
              type="file"
              id="fileInput"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-2">
              <FileSpreadsheet className="h-10 w-10 text-primary-600 dark:text-primary-400" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {file ? file.name : 'Haz clic para seleccionar o arrastra el archivo de insumo (.csv, .xlsx)'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Soporta archivos separados por tabulación o comas'}
                </span>
              </div>
            </label>
          </div>

          {/* Tarjeta de Resultados Detallada con Métricas Exactas */}
          {uploadResult && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                <span>¡Importación Procesada y Persistida!</span>
              </div>

              {/* Grid de Resumen: Nuevas, Actualizadas, Total */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                
                {/* Nuevas */}
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                    <PlusCircle className="h-3 w-3" />
                    <span>Nuevas</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {uploadResult.db_import?.nuevas?.toLocaleString() ?? 0}
                  </div>
                </div>

                {/* Actualizadas */}
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-primary-200 dark:border-primary-800 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-primary-700 dark:text-primary-400 uppercase">
                    <UpdateIcon className="h-3 w-3" />
                    <span>Actualizadas</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {uploadResult.db_import?.actualizadas?.toLocaleString() ?? 0}
                  </div>
                </div>

                {/* Total Insumo */}
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Total
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {uploadResult.metadata?.total_records?.toLocaleString() ?? 0}
                  </div>
                </div>

              </div>

              {uploadResult.db_import?.warnings?.map((w: string, idx: number) => (
                <div key={idx} className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  ⚠️ {w}
                </div>
              ))}
            </div>
          )}

          {/* Mensajes de Error Claros y Esenciales */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-rose-900 dark:text-rose-200 block">Error en la importación del insumo:</span>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-400 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition-all active:scale-95"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Procesando en PostgreSQL...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Importar Insumo</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
