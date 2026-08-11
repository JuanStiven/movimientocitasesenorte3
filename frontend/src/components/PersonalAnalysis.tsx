'use client';

import React from 'react';
import { UserCheck, Stethoscope, Bookmark, Search, Download } from 'lucide-react';

interface PersonalAnalysisProps {
  personalData: {
    personal_asistencial: any[];
    especialidades: any[];
    programas: any[];
  };
}

export const PersonalAnalysis: React.FC<PersonalAnalysisProps> = ({ personalData }) => {
  const [searchDoctor, setSearchDoctor] = React.useState('');

  const filteredDoctors = React.useMemo(() => {
    if (!personalData?.personal_asistencial) return [];
    if (!searchDoctor) return personalData.personal_asistencial;
    return personalData.personal_asistencial.filter((doc: any) =>
      doc.medico?.toLowerCase().includes(searchDoctor.toLowerCase())
    );
  }, [personalData, searchDoctor]);

  // Exportar a CSV la tabla CITAS ASIGNADAS POR PERSONAL ASISTENCIAL
  const handleExportCSV = () => {
    if (!filteredDoctors || filteredDoctors.length === 0) return;

    const headers = ['Médico / Profesional', 'Total Citas', 'Finalizadas', 'En Sala', 'Descartadas', 'En Blanco'];
    const rows = filteredDoctors.map((doc: any) => [
      doc.medico || 'POR ASIGNAR',
      doc.total || 0,
      doc.finalizadas || 0,
      doc.en_sala || 0,
      doc.descartada || 0,
      doc.en_blanco || 0,
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
    link.setAttribute('download', `citas_asignadas_personal_asistencial_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      
      {/* 1. Tabla Principal: Personal Asistencial */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-3.5 sm:p-4 bg-sidebar dark:bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary-300" />
            <div>
              <h2 className="font-bold text-xs sm:text-sm">CITAS ASIGNADAS POR PERSONAL ASISTENCIAL</h2>
              <p className="text-[11px] text-sidebar-text">Alimentado por mediconombre y estado_consulta</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Campo Búsqueda Médico */}
            <div className="relative flex-1 sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre de médico..."
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                className="bg-slate-900 dark:bg-slate-800 text-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400 w-full"
              />
            </div>

            {/* Botón Exportar CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all active:scale-95 flex-shrink-0"
              title="Exportar tabla a archivo CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[380px]">
          <table className="w-full text-left border-collapse text-xs min-w-[650px]">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-2.5 sm:p-3">Médico / Profesional</th>
                <th className="p-2.5 sm:p-3 text-center">Total Citas</th>
                <th className="p-2.5 sm:p-3 text-center">Finalizadas</th>
                <th className="p-2.5 sm:p-3 text-center">En Sala</th>
                <th className="p-2.5 sm:p-3 text-center">Descartadas</th>
                <th className="p-2.5 sm:p-3 text-center">En Blanco</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDoctors.map((doc: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {doc.medico ? doc.medico.charAt(0) : 'M'}
                    </span>
                    <span className="truncate max-w-[240px] sm:max-w-[320px]" title={doc.medico}>{doc.medico}</span>
                  </td>
                  <td className="p-2.5 sm:p-3 text-center font-bold text-slate-900 dark:text-slate-100">{doc.total}</td>
                  <td className="p-2.5 sm:p-3 text-center font-semibold text-slate-800 dark:text-slate-200">{doc.finalizadas}</td>
                  <td className="p-2.5 sm:p-3 text-center font-semibold text-slate-800 dark:text-slate-200">{doc.en_sala}</td>
                  <td className="p-2.5 sm:p-3 text-center text-slate-600 dark:text-slate-400">{doc.descartada || 0}</td>
                  <td className="p-2.5 sm:p-3 text-center font-medium text-slate-600 dark:text-slate-400">{doc.en_blanco || 0}</td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 dark:text-slate-500">
                    No se encontraron registros de personal asistencial con el filtro actual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Grid Secundario: Especialidades y Programas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Citas Asignadas por Especialidad */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-3.5 bg-sidebar dark:bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary-300" />
              <h3 className="font-bold text-xs sm:text-sm">CITAS ASIGNADAS POR ESPECIALIDAD</h3>
            </div>
            <span className="text-[11px] text-sidebar-text">medicoespecialidad</span>
          </div>

          <div className="overflow-x-auto max-h-[320px]">
            <table className="w-full text-left border-collapse text-xs min-w-[450px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">Especialidad</th>
                  <th className="p-2.5 text-center">Total</th>
                  <th className="p-2.5 text-center">Fin.</th>
                  <th className="p-2.5 text-center">Sala</th>
                  <th className="p-2.5 text-center">Prom. Espera</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {personalData?.especialidades?.map((esp: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={esp.especialidad}>
                      {esp.especialidad}
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 dark:text-slate-100">{esp.total}</td>
                    <td className="p-2.5 text-center font-semibold text-slate-800 dark:text-slate-200">{esp.finalizadas}</td>
                    <td className="p-2.5 text-center font-semibold text-slate-800 dark:text-slate-200">{esp.en_sala}</td>
                    <td className="p-2.5 text-center font-bold text-primary-700 dark:text-primary-300">
                      {esp.promedio_dias_espera}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Citas Asignadas por Programa / PYM */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-3.5 bg-sidebar dark:bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-primary-300" />
              <h3 className="font-bold text-xs sm:text-sm">CITAS POR PROGRAMA / PYM</h3>
            </div>
            <span className="text-[11px] text-sidebar-text">Distribución</span>
          </div>

          <div className="overflow-x-auto max-h-[320px]">
            <table className="w-full text-left border-collapse text-xs min-w-[400px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">Programa / PYM</th>
                  <th className="p-2.5 text-center">Total Citas</th>
                  <th className="p-2.5 text-right">Porcentaje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {personalData?.programas?.map((prog: any, idx: number) => {
                  const totalGlobal = personalData.programas.reduce((acc: number, curr: any) => acc + curr.total, 0);
                  const pct = totalGlobal ? Math.round((prog.total / totalGlobal) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={prog.pym}>
                        {prog.pym}
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-900 dark:text-slate-100">{prog.total}</td>
                      <td className="p-2.5 text-right font-semibold text-primary-600 dark:text-primary-400">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-14 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-primary-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
