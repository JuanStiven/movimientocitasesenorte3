'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, CheckSquare, X } from 'lucide-react';

interface MultiSearchableSelectProps {
  label?: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export const MultiSearchableSelect: React.FC<MultiSearchableSelectProps> = ({
  label,
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Seleccionar opciones...",
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Opciones reales de la lista sin "Todas"
  const cleanOptions = React.useMemo(() => {
    return options.filter((opt) => opt && opt.toUpperCase() !== 'TODAS');
  }, [options]);

  // Determinar si "Todas" está activo (sin selección específica o 'Todas')
  const isAllSelected = React.useMemo(() => {
    if (!selectedValues || selectedValues.length === 0) return true;
    if (selectedValues.includes('Todas')) return true;
    return selectedValues.length === cleanOptions.length && cleanOptions.length > 0;
  }, [selectedValues, cleanOptions]);

  // Filtrar según el término de búsqueda
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return cleanOptions;
    const term = searchTerm.toLowerCase();
    return cleanOptions.filter((opt) => opt.toLowerCase().includes(term));
  }, [cleanOptions, searchTerm]);

  // Manejar toggle de "Todas"
  const handleSelectAll = () => {
    onChange(['Todas']);
  };

  // Manejar toggle de un elemento individual
  const handleToggleOption = (option: string) => {
    let currentSelected = selectedValues.filter((v) => v !== 'Todas');
    
    if (currentSelected.includes(option)) {
      currentSelected = currentSelected.filter((v) => v !== option);
    } else {
      currentSelected = [...currentSelected, option];
    }

    if (currentSelected.length === 0 || currentSelected.length === cleanOptions.length) {
      onChange(['Todas']);
    } else {
      onChange(currentSelected);
    }
  };

  // Etiqueta a mostrar en el botón principal
  const getButtonText = () => {
    if (isAllSelected) return 'Todas las opciones';
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} seleccionadas`;
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          {icon}
          {label}
        </label>
      )}

      {/* Botón Selector Principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 flex items-center justify-between font-medium hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors focus:ring-2 focus:ring-primary-500"
      >
        <div className="flex items-center gap-1.5 truncate pr-2">
          {!isAllSelected && (
            <span className="bg-primary-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
              {selectedValues.length}
            </span>
          )}
          <span className="truncate text-left" title={getButtonText()}>
            {getButtonText()}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Desplegable con Búsqueda y Lista de Selección Múltiple */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in max-h-72 flex flex-col">
          
          {/* Input de Búsqueda */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative bg-slate-50 dark:bg-slate-950 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Escribe para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-8 pr-7 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones Rápidas: Seleccionar Todas / Limpiar */}
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 ${
                isAllSelected ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <CheckSquare className="h-3 w-3" />
              <span>Marcar Todas</span>
            </button>
            {!isAllSelected && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Limpiar selección
              </button>
            )}
          </div>

          {/* Lista de Opciones con Checkboxes */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-50 dark:divide-slate-800/50">
            {/* Opción "Todas las opciones" */}
            <button
              type="button"
              onClick={handleSelectAll}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                isAllSelected
                  ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => {}}
                  className="rounded text-primary-600 focus:ring-primary-500 h-3.5 w-3.5 pointer-events-none"
                />
                <span className="truncate font-semibold">Todas las opciones</span>
              </div>
            </button>

            {/* Opciones Específicas */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isChecked = !isAllSelected && selectedValues.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleOption(opt)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      isChecked
                        ? 'bg-primary-50/70 dark:bg-primary-950/40 text-primary-800 dark:text-primary-200 font-medium'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-primary-600 focus:ring-primary-500 h-3.5 w-3.5 pointer-events-none"
                      />
                      <span className="truncate" title={opt}>
                        {opt}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                No hay opciones disponibles que coincidan
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
