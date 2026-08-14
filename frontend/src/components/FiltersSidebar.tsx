'use client';

import React from 'react';
import { Filter, RotateCcw, Calendar, CheckSquare, Stethoscope, Building, ShieldAlert, User, Clock, Bookmark, FileText } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { MultiSearchableSelect } from './MultiSearchableSelect';

interface FiltersSidebarProps {
  filtersOptions: any;
  selectedFilters: {
    filtro_ebs: string | string[];
    convenionombre: string[];
    estado_cita: string[];
    estado_consulta: string[];
    especialidad: string[];
    mediconombre: string[];
    pym: string[];
    sede: string[];
    tipocita: string[];
    nombrecompleto: string;
    fechacita_inicio: string;
    fechacita_fin: string;
    fechadeseada_inicio: string;
    fechadeseada_fin: string;
    fechaasignacion_inicio: string;
    fechaasignacion_fin: string;
    fechaatencion_inicio: string;
    fechaatencion_fin: string;
    solo_alertas: boolean;
  };
  onFilterChange: (key: string, value: any) => void;
  onResetFilters: () => void;
  isMobileOpen?: boolean;
  activeTab?: string;
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  filtersOptions,
  selectedFilters,
  onFilterChange,
  onResetFilters,
  isMobileOpen = false,
  activeTab = 'general',
}) => {
  return (
    <aside
      className={`w-full lg:w-80 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 space-y-4 transition-all max-h-[85vh] overflow-y-auto ${
        isMobileOpen ? 'block animate-slide-in' : 'hidden lg:block'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 sticky top-0 bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-2 text-primary-950 dark:text-slate-100 font-bold text-xs sm:text-sm tracking-wide">
          <Filter className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span>FILTROS DE REPORTE</span>
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold transition-colors"
          title="Restablecer todos los filtros"
        >
          <RotateCcw className="h-3 w-3" />
          Limpiar
        </button>
      </div>

      {/* 1. Búsqueda por Paciente (nombrecompleto) - Oculto en Análisis General y Personal Asistencial */}
      {activeTab !== 'personal' && activeTab !== 'general' && (
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            Nombre Paciente
          </label>
          <input
            type="text"
            placeholder="Escribe para buscar paciente..."
            value={selectedFilters.nombrecompleto}
            onChange={(e) => onFilterChange('nombrecompleto', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 font-medium"
          />
        </div>
      )}

      {/* 2. Filtro EBS (Equipos Básicos) */}
      <SearchableSelect
        label="Filtro EBS (Equipos Básicos)"
        icon={<CheckSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
        options={filtersOptions?.filtro_ebs || ['Todas', 'Si', 'No']}
        value={typeof selectedFilters.filtro_ebs === 'string' ? selectedFilters.filtro_ebs : 'Todas'}
        onChange={(val) => onFilterChange('filtro_ebs', val)}
      />

      {/* 3. Convenio Nombre */}
      <MultiSearchableSelect
        label="Convenio (convenionombre)"
        icon={<FileText className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />}
        options={filtersOptions?.convenionombre || ['Todas']}
        selectedValues={Array.isArray(selectedFilters.convenionombre) ? selectedFilters.convenionombre : ['Todas']}
        onChange={(val) => onFilterChange('convenionombre', val)}
      />

      {/* 4. Estado Cita */}
      <MultiSearchableSelect
        label="Estado Cita (estado_cita)"
        options={filtersOptions?.estado_cita || ['Todas']}
        selectedValues={Array.isArray(selectedFilters.estado_cita) ? selectedFilters.estado_cita : ['Todas']}
        onChange={(val) => onFilterChange('estado_cita', val)}
      />

      {/* 5. Estado Consulta */}
      <MultiSearchableSelect
        label="Estado Consulta (estado_consulta)"
        options={filtersOptions?.estado_consulta || ['Todas']}
        selectedValues={Array.isArray(selectedFilters.estado_consulta) ? selectedFilters.estado_consulta : ['Todas']}
        onChange={(val) => onFilterChange('estado_consulta', val)}
      />

      {/* 6. Tipo Cita */}
      <MultiSearchableSelect
        label="Tipo de Cita (tipocita)"
        options={filtersOptions?.tipocita || ['Todas']}
        selectedValues={Array.isArray(selectedFilters.tipocita) ? selectedFilters.tipocita : ['Todas']}
        onChange={(val) => onFilterChange('tipocita', val)}
      />

      {/* 7. Especialidad */}
      <MultiSearchableSelect
        label="Especialidad (medicoespecialidad)"
        icon={<Stethoscope className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />}
        options={filtersOptions?.especialidad || ['Todas']}
        selectedValues={Array.isArray(selectedFilters.especialidad) ? selectedFilters.especialidad : ['Todas']}
        onChange={(val) => onFilterChange('especialidad', val)}
      />

      {/* 8. Médico / Profesional */}
      <MultiSearchableSelect
        label="Médico / Profesional (mediconombre)"
        icon={<User className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />}
        options={filtersOptions?.mediconombre || ['Todas']}
        selectedValues={Array.isArray(selectedFilters.mediconombre) ? selectedFilters.mediconombre : ['Todas']}
        onChange={(val) => onFilterChange('mediconombre', val)}
      />

      {/* 9. PYM / Programa */}
      <MultiSearchableSelect
        label="Programa / PYM (pym)"
        icon={<Bookmark className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
        options={filtersOptions?.pym || ['Todas']}
        selectedValues={Array.isArray(selectedFilters.pym) ? selectedFilters.pym : ['Todas']}
        onChange={(val) => onFilterChange('pym', val)}
      />

      {/* 10. Sede */}
      <MultiSearchableSelect
        label="Sede / Centro (nombresede)"
        icon={<Building className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />}
        options={filtersOptions?.sede || ['Todas']}
        selectedValues={Array.isArray(selectedFilters.sede) ? selectedFilters.sede : ['Todas']}
        onChange={(val) => onFilterChange('sede', val)}
      />

      {/* 11. Rangos de Fechas */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        
        {/* Fecha Cita */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Calendar className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            Fecha Cita (fechacita)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="date"
              value={selectedFilters.fechacita_inicio}
              onChange={(e) => onFilterChange('fechacita_inicio', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 font-medium"
            />
            <input
              type="date"
              value={selectedFilters.fechacita_fin}
              onChange={(e) => onFilterChange('fechacita_fin', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 font-medium"
            />
          </div>
        </div>

        {/* Fecha Deseada */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            Fecha Deseada (fechadeseada)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="date"
              value={selectedFilters.fechadeseada_inicio}
              onChange={(e) => onFilterChange('fechadeseada_inicio', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 font-medium"
            />
            <input
              type="date"
              value={selectedFilters.fechadeseada_fin}
              onChange={(e) => onFilterChange('fechadeseada_fin', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 font-medium"
            />
          </div>
        </div>

        {/* Fecha Asignación */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            Fecha Asignación (fechaasignacion)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="date"
              value={selectedFilters.fechaasignacion_inicio}
              onChange={(e) => onFilterChange('fechaasignacion_inicio', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 font-medium"
            />
            <input
              type="date"
              value={selectedFilters.fechaasignacion_fin}
              onChange={(e) => onFilterChange('fechaasignacion_fin', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 font-medium"
            />
          </div>
        </div>

        {/* Fecha Atención */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Fecha Atención (fechaatencion)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="date"
              value={selectedFilters.fechaatencion_inicio}
              onChange={(e) => onFilterChange('fechaatencion_inicio', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 font-medium"
            />
            <input
              type="date"
              value={selectedFilters.fechaatencion_fin}
              onChange={(e) => onFilterChange('fechaatencion_fin', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 font-medium"
            />
          </div>
        </div>

      </div>

      {/* 12. Toggle Alertas */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center gap-2 cursor-pointer p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
          <input
            type="checkbox"
            checked={selectedFilters.solo_alertas}
            onChange={(e) => onFilterChange('solo_alertas', e.target.checked)}
            className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
          />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
            <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span>Ver solo Alertas (&gt;3d SALA)</span>
          </div>
        </label>
      </div>

    </aside>
  );
};
