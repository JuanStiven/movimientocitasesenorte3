import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Search, Download } from 'lucide-react';
import { useSortableData } from '@/utils/useSortableData';
import { SortableHeader } from './SortableHeader';

interface AlertsModuleProps {
  alerts: any[];
}

export const AlertsModule: React.FC<AlertsModuleProps> = ({ alerts = [] }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const rawAlerts = React.useMemo(() => {
    if (!alerts) return [];
    if (!searchTerm) return alerts;
    const term = searchTerm.toLowerCase();
    return alerts.filter(
      (a: any) =>
        a.medico?.toLowerCase().includes(term) ||
        a.especialidad?.toLowerCase().includes(term) ||
        a.sede?.toLowerCase().includes(term)
    );
  }, [alerts, searchTerm]);

  const { items: filteredAlerts, requestSort, sortConfig } = useSortableData(rawAlerts);

  // Exportar a CSV la tabla LISTADO DETALLADO DE CITAS EN ALERTA
  const handleExportCSV = () => {
    if (!filteredAlerts || filteredAlerts.length === 0) return;

    const headers = [
      'ID Cita',
      'Médico / Profesional',
      'Especialidad',
      'Sede / Centro',
      'Estado Cita',
      'Estado Consulta',
      'Días en Sala',
      'Fecha Cita',
      'Fecha Asignación'
    ];

    const rows = filteredAlerts.map((a: any) => [
      a.id || '',
      a.medico || '',
      a.especialidad || '',
      a.sede || '',
      a.estado_cita || '',
      a.estado_consulta || '',
      a.dias_en_sala || 0,
      a.fechacita_str || '',
      a.fechaasignacion_str || ''
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
    link.setAttribute('download', `citas_en_alerta_sala_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      
      {/* Banner Informativo de Alertas */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-primary-600/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-500/30">
            <AlertTriangle className="h-7 w-7 text-primary-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-white">MÓDULO DE ALERTAS: CITAS &gt; 3 DÍAS EN SALA</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Identificación prioritaria de pacientes cuya consulta permanece en estado <strong>EN SALA</strong> por más de 3 días.
            </p>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-center self-stretch md:self-auto flex items-center justify-center gap-2">
          <span className="text-2xl font-black text-primary-400">{alerts.length}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Casos Críticos</span>
        </div>
      </div>

      {/* Tabla de Alertas */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-3.5 sm:p-4 bg-sidebar dark:bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary-300" />
            <div>
              <h3 className="font-bold text-xs sm:text-sm">LISTADO DETALLADO DE CITAS EN ALERTA ({alerts.length})</h3>
              <p className="text-[11px] text-sidebar-text">Filtradas según criterios activos en la barra lateral</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Buscador Rápido */}
            <div className="relative flex-1 sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por médico, sede o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 dark:bg-slate-800 text-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400 w-full"
              />
            </div>

            {/* Botón Exportar CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all active:scale-95 flex-shrink-0"
              title="Exportar listado de alertas a archivo CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-left border-collapse text-xs min-w-[750px]">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <SortableHeader label="ID" fieldKey="id" sortConfig={sortConfig} onSort={requestSort} align="center" />
                <SortableHeader label="Médico / Profesional" fieldKey="medico" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Especialidad" fieldKey="especialidad" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Sede" fieldKey="sede" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Estado Cita" fieldKey="estado_cita" sortConfig={sortConfig} onSort={requestSort} align="center" />
                <SortableHeader label="Estado Consulta" fieldKey="estado_consulta" sortConfig={sortConfig} onSort={requestSort} align="center" />
                <SortableHeader label="Días en Sala" fieldKey="dias_en_sala" sortConfig={sortConfig} onSort={requestSort} align="center" />
                <SortableHeader label="Fecha Cita" fieldKey="fechacita_str" sortConfig={sortConfig} onSort={requestSort} align="center" />
                <SortableHeader label="Fecha Asignación" fieldKey="fechaasignacion_str" sortConfig={sortConfig} onSort={requestSort} align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAlerts.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-3 text-center font-bold text-slate-400 dark:text-slate-500">#{row.id}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{row.medico || 'POR ASIGNAR'}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{row.especialidad}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 truncate max-w-[180px]" title={row.sede}>{row.sede}</td>
                  <td className="p-3 text-center">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {row.estado_cita}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {row.estado_consulta}
                    </span>
                  </td>
                  <td className="p-3 text-center font-black text-primary-700 dark:text-primary-300 text-sm">
                    {row.dias_en_sala} días
                  </td>
                  <td className="p-3 text-center text-slate-600 dark:text-slate-400 font-mono text-[11px]">{row.fechacita_str}</td>
                  <td className="p-3 text-center text-slate-500 dark:text-slate-400 font-mono text-[11px]">{row.fechaasignacion_str}</td>
                </tr>
              ))}
              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="h-8 w-8 text-primary-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No se encontraron citas con alertas (&gt;3 días en Sala) para este filtro</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
