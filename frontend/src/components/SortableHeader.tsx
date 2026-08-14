'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortConfig } from '@/utils/useSortableData';

interface SortableHeaderProps {
  label: string;
  fieldKey: string;
  sortConfig: SortConfig<any> | null;
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  fieldKey,
  sortConfig,
  onSort,
  align = 'left',
  className = '',
}) => {
  const isActive = sortConfig?.key === fieldKey;
  const direction = isActive ? sortConfig.direction : null;

  const alignClasses =
    align === 'center'
      ? 'justify-center text-center'
      : align === 'right'
      ? 'justify-end text-right'
      : 'justify-start text-left';

  return (
    <th
      onClick={() => onSort(fieldKey)}
      className={`p-3 select-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors ${className}`}
      title={`Clic para ordenar por ${label}`}
    >
      <div className={`flex items-center gap-1.5 font-bold ${alignClasses}`}>
        <span className="truncate">{label}</span>
        <span className="flex-shrink-0 text-slate-400 dark:text-slate-500">
          {direction === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
          ) : direction === 'desc' ? (
            <ArrowDown className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
          )}
        </span>
      </div>
    </th>
  );
};
