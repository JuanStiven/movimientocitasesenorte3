'use client';

import React, { useState } from 'react';
import { List, Search, Download, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertTriangle, ShieldAlert, User } from 'lucide-react';
import { apiFetch } from '@/utils/api';

interface DetailsTableProps {
  detailsData: {
    page: number;
    limit: number;
    total_records: number;
    total_pages: number;
    data: any[];
  } | null;
  page: number;
  setPage: (p: number) => void;
  search: string;
  setSearch: (s: string) => void;
  filters?: any;
}

export const DetailsTable: React.FC<DetailsTableProps> = ({
  detailsData,
  page,
  setPage,
  search,
  setSearch,
  filters,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Exportar a CSV todos los registros filtrados llamando al endpoint con limit=100000
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        search: search || filters?.nombrecompleto || '',
        filtro_ebs: filters?.filtro_ebs || 'Todas',
        convenionombre: filters?.convenionombre || 'Todas',
        estado_cita: filters?.estado_cita || 'Todas',
        estado_consulta: filters?.estado_consulta || 'Todas',
        especialidad: filters?.especialidad || 'Todas',
        mediconombre: filters?.mediconombre || 'Todas',
        pym: filters?.pym || 'Todas',
        sede: filters?.sede || 'Todas',
        tipocita: filters?.tipocita || 'Todas',
        fechacita_inicio: filters?.fechacita_inicio || '',
        fechacita_fin: filters?.fechacita_fin || '',
      });

      // Paginar hasta recolectar todos los registros filtrados (el API limita a 100 por página)
      const exportRows: any[] = [];
      let pageNum = 1;
      let totalRecords = 1;
      while (exportRows.length < totalRecords && pageNum <= 10000) {
        params.set('page', String(pageNum));
        const res = await apiFetch(`/api/dashboard/details?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Error del servidor: ${res.status}`);
        }
        const result = await res.json();
        totalRecords = result.total_records ?? 0;
        exportRows.push(...(result.data || []));
        pageNum += 1;
      }

      if (exportRows.length === 0) {
        alert("No hay registros para exportar con los filtros actuales.");
        return;
      }

      const headers = [
        'ID Cita',
        'Paciente',
        'Médico / Profesional',
        'Especialidad',
        'Sede / Centro',
        'Convenio',
        'Filtro EBS',
        'Tipo Cita',
        'Estado Cita',
        'Estado Consulta',
        'Fecha Cita',
        'Fecha Deseada',
        'Fecha Asignación',
        'Fecha Atención',
        'Finalidad',
        'Programa / PYM',
        'Días en Sala'
      ];

      const rows = exportRows.map((r: any) => [
        r.id || '',
        r.nombrecompleto || '',
        r.medico || r.mediconombre || '',
        r.especialidad || '',
        r.sede || '',
        r.convenionombre || '',
        r.filtro_ebs || '',
        r.tipocita || '',
        r.estado_cita || '',
        r.estado_consulta || '',
        r.fechacita_str || '',
        r.fechadeseada_str || '',
        r.fechaasignacion_str || '',
        r.fechaatencion_str || '',
        r.finalidad || '',
        r.pym || '',
        r.dias_en_sala || 0
      ]);

      const BOM = '\uFEFF';
      const csvContent = BOM + [
        headers.join(';'),
        ...rows.map((row: any[]) => row.map((cell) => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(';'))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `detalle_movimiento_citas_esenorte3_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al exportar CSV:", err);
      alert("No se pudo exportar el archivo CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const totalRecords = detailsData?.total_records || 0;
  const totalPages = detailsData?.total_pages || 1;
  const records = detailsData?.data || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors w-full min-w-0">
      
      {/* Header del Componente */}
      <div className="p-3.5 sm:p-4 bg-sidebar dark:bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary-300" />
          <div>
            <h2 className="font-bold text-xs sm:text-sm">DETALLE DE MOVIMIENTO DE CITAS</h2>
            <p className="text-[11px] text-sidebar-text">
              Mostrando {records.length} de {totalRecords} registros encontrados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Campo de Búsqueda Rápida */}
          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, médico o sede..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 dark:bg-slate-800 text-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400 w-full"
            />
          </div>

          {/* Botón Exportar CSV */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow transition-all active:scale-95 flex-shrink-0"
            title="Exportar todos los registros filtrados a CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Generando...' : 'Exportar CSV'}</span>
          </button>
        </div>
      </div>

      {/* Tabla con scroll horizontal responsivo */}
      <div className="overflow-x-auto max-h-[550px] w-full">
        <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3 text-center">ID</th>
              <th className="p-3">Paciente</th>
              <th className="p-3">Especialidad</th>
              <th className="p-3">Estado Cita</th>
              <th className="p-3">Estado Consulta</th>
              <th className="p-3">Filtro EBS</th>
              <th className="p-3 text-center">Fecha Cita</th>
              <th className="p-3 text-center">Fecha Asignación</th>
              <th className="p-3">Médico / Profesional</th>
              <th className="p-3">Sede</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((row: any) => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="p-3 text-center font-bold text-slate-400 dark:text-slate-500">#{row.id}</td>
                
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                    <span className="truncate max-w-[180px]" title={row.nombrecompleto}>{row.nombrecompleto || 'DESCONOCIDO'}</span>
                  </div>
                </td>

                <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{row.especialidad}</td>
                
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    row.estado_cita === 'FINALIZADA' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    row.estado_cita === 'INCUMPLIDO' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    row.estado_cita === 'CITA CANCELADA' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {row.estado_cita}
                  </span>
                </td>

                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    row.estado_consulta === 'FINALIZADA' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    row.estado_consulta === 'EN SALA' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    row.estado_consulta === 'DESCARTADA' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {row.estado_consulta}
                  </span>
                </td>

                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    row.filtro_ebs === 'Si' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {row.filtro_ebs === 'Si' ? 'EBS (Si)' : 'No'}
                  </span>
                </td>

                <td className="p-3 text-center text-slate-600 dark:text-slate-300 font-mono text-[11px]">{row.fechacita_str}</td>
                <td className="p-3 text-center text-slate-500 dark:text-slate-400 font-mono text-[11px]">{row.fechaasignacion_str}</td>
                
                <td className="p-3 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]" title={row.medico}>
                  {row.medico || row.mediconombre || 'POR ASIGNAR'}
                </td>
                
                <td className="p-3 text-slate-600 dark:text-slate-300 truncate max-w-[160px]" title={row.sede}>{row.sede}</td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan={10} className="p-8 text-center text-slate-400 dark:text-slate-500">
                  No se encontraron citas que coincidan con la búsqueda y filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginador */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Página {page} de {totalPages} ({totalRecords} registros totales)
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-2">{page}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
