import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

export function useSortableData<T>(items: T[], initialSortConfig: SortConfig<T> | null = null) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialSortConfig);

  const sortedItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    if (!sortConfig) return items;

    const sortableItems = [...items];
    sortableItems.sort((a: any, b: any) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Manejo de nulos / indefinidos / guiño '-'
      const isNullA = valA === null || valA === undefined || valA === '-' || valA === '';
      const isNullB = valB === null || valB === undefined || valB === '-' || valB === '';

      if (isNullA && isNullB) return 0;
      if (isNullA) return 1;
      if (isNullB) return -1;

      // 1. Tipo numérico puro
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }

      // 2. Cadenas numéricas (ej. "12", "100")
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB) && typeof valA !== 'boolean' && typeof valB !== 'boolean') {
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // 3. Fechas (ej. "2026-07-01", "2026-07-01 14:30")
      const strA = String(valA).trim();
      const strB = String(valB).trim();
      const isDatePattern = /^\d{4}-\d{2}-\d{2}/.test(strA) && /^\d{4}-\d{2}-\d{2}/.test(strB);
      if (isDatePattern) {
        const timeA = new Date(strA).getTime();
        const timeB = new Date(strB).getTime();
        if (!isNaN(timeA) && !isNaN(timeB)) {
          return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
        }
      }

      // 4. Cadenas de Texto (Ordenamiento alfabético A-Z / Z-A)
      const res = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
      return sortConfig.direction === 'asc' ? res : -res;
    });

    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof T | string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
}
