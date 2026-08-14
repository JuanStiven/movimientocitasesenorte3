# Registro de Componentes (Frontend Next.js)

Este archivo mantiene un inventario de los componentes reutilizables creados en el frontend del proyecto **nexosalud** para evitar la duplicidad de código.
**Como asistente IA, debes consultar este registro antes de crear un nuevo componente y actualizarlo obligatoriamente cuando crees uno genérico o reutilizable.**

## Componentes Disponibles

### MultiSearchableSelect
- **Ruta:** `frontend/src/components/MultiSearchableSelect.tsx`
- **Descripción:** Componente desplegable de selección múltiple con buscador dinámico en tiempo real, casillas de verificación (checkboxes) e ítem de "Todas las opciones".
- **Props principales:** `label` (string), `options` (string[]), `selectedValues` (string[]), `onChange` (function), `icon` (ReactNode).

### SortableHeader
- **Ruta:** `frontend/src/components/SortableHeader.tsx`
- **Descripción:** Encabezado de tabla interactivo (`<th>`) para ordenamiento de columnas por texto (A-Z/Z-A), números o fechas, con indicadores visuales `ArrowUp`, `ArrowDown` y `ArrowUpDown`.
- **Props principales:** `label` (string), `fieldKey` (string), `sortConfig` (SortConfig), `onSort` (function), `align` ('left' | 'center' | 'right').

---
