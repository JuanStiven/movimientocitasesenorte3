'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/utils/api';
import { Header } from '@/components/Header';
import { FiltersSidebar } from '@/components/FiltersSidebar';
import { KPICards } from '@/components/KPICards';
import { GeneralCharts } from '@/components/GeneralCharts';
import { PersonalAnalysis } from '@/components/PersonalAnalysis';
import { AlertsModule } from '@/components/AlertsModule';
import { DetailsTable } from '@/components/DetailsTable';
import { DataImporterModal } from '@/components/DataImporterModal';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'general' | 'personal' | 'alerts' | 'details'>('general');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState<any>(null);
  const [filtersOptions, setFiltersOptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Controlar clase dark en el elemento documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Helper para construir URLSearchParams con soporte para arreglos multiselect
  const buildQueryParams = useCallback((filterObj: any, extraParams: Record<string, string> = {}) => {
    const params = new URLSearchParams();

    Object.entries(extraParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });

    const multiKeys = [
      'convenionombre',
      'estado_cita',
      'estado_consulta',
      'especialidad',
      'mediconombre',
      'pym',
      'sede',
      'tipocita',
    ];

    Object.entries(filterObj).forEach(([key, val]) => {
      if (multiKeys.includes(key)) {
        if (Array.isArray(val)) {
          val.forEach((item) => {
            if (item && item !== 'Todas') {
              params.append(key, item);
            }
          });
        } else if (typeof val === 'string' && val && val !== 'Todas') {
          params.append(key, val);
        }
      } else if (typeof val === 'boolean') {
        if (val) params.append(key, 'true');
      } else if (typeof val === 'string' && val && val !== 'Todas' && val !== '') {
        params.append(key, val);
      }
    });

    return params;
  }, []);

  // Filtros seleccionados para las columnas del reporte
  const [filters, setFilters] = useState({
    filtro_ebs: 'Todas',
    convenionombre: ['Todas'],
    estado_cita: ['Todas'],
    estado_consulta: ['Todas'],
    especialidad: ['Todas'],
    mediconombre: ['Todas'],
    pym: ['Todas'],
    sede: ['Todas'],
    tipocita: ['Todas'],
    nombrecompleto: '',
    fechacita_inicio: '',
    fechacita_fin: '',
    fechadeseada_inicio: '',
    fechadeseada_fin: '',
    fechaasignacion_inicio: '',
    fechaasignacion_fin: '',
    fechaatencion_inicio: '',
    fechaatencion_fin: '',
    solo_alertas: false,
  });

  // Datos para cada sección
  const [overviewData, setOverviewData] = useState<any>(null);
  const [personalData, setPersonalData] = useState<any>(null);
  const [alertsData, setAlertsData] = useState<any[]>([]);
  
  // Estado para la tabla de detalle
  const [detailsData, setDetailsData] = useState<any>(null);
  const [detailPage, setDetailPage] = useState(1);
  const [detailSearch, setDetailSearch] = useState('');
  const [detailSortBy, setDetailSortBy] = useState<string>('');
  const [detailSortOrder, setDetailSortOrder] = useState<'asc' | 'desc'>('asc');

  // 1. Obtener lista de filtros disponibles
  const fetchFilters = useCallback(async () => {
    try {
      const res = await apiFetch('/api/dashboard/filters');
      const data = await res.json();
      setFiltersOptions(data);
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  }, []);

  // 2. Obtener metadatos del insumo cargado
  const fetchDatasetInfo = useCallback(async () => {
    try {
      const res = await apiFetch('/api/upload/info');
      const data = await res.json();
      setDatasetInfo(data);
    } catch (err) {
      console.error('Error fetching dataset info:', err);
    }
  }, []);

  // 3. Cargar datos del dashboard según filtros
  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildQueryParams(filters);
      const res = await apiFetch(`/api/dashboard/overview?${params.toString()}`);
      const data = await res.json();
      setOverviewData(data);
    } catch (err) {
      console.error('Error fetching overview:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, buildQueryParams]);

  // 4. Cargar datos asistenciales
  const fetchPersonal = useCallback(async () => {
    try {
      const params = buildQueryParams(filters);
      const res = await apiFetch(`/api/dashboard/personal?${params.toString()}`);
      const data = await res.json();
      setPersonalData(data);
    } catch (err) {
      console.error('Error fetching personal analysis:', err);
    }
  }, [filters, buildQueryParams]);

  // 5. Cargar Alertas (>3 días en Sala)
  const fetchAlerts = useCallback(async () => {
    try {
      const params = buildQueryParams(filters);
      const res = await apiFetch(`/api/dashboard/alerts?${params.toString()}`);
      const data = await res.json();
      setAlertsData(data.alerts || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  }, [filters, buildQueryParams]);

  // 6. Cargar Detalle paginado con ordenamiento global
  const fetchDetails = useCallback(async () => {
    try {
      const extraParams: Record<string, string> = {
        page: detailPage.toString(),
        limit: '25',
        search: detailSearch || filters.nombrecompleto,
      };
      if (detailSortBy) {
        extraParams.sort_by = detailSortBy;
        extraParams.sort_order = detailSortOrder;
      }
      const params = buildQueryParams(filters, extraParams);
      const res = await apiFetch(`/api/dashboard/details?${params.toString()}`);
      const data = await res.json();
      setDetailsData(data);
    } catch (err) {
      console.error('Error fetching details:', err);
    }
  }, [detailPage, detailSearch, detailSortBy, detailSortOrder, filters, buildQueryParams]);

  // Efectos de carga inicial
  useEffect(() => {
    fetchDatasetInfo();
    fetchFilters();
  }, [fetchDatasetInfo, fetchFilters]);

  useEffect(() => {
    fetchOverview();
    if (activeTab === 'personal') fetchPersonal();
    if (activeTab === 'alerts') fetchAlerts();
    if (activeTab === 'details') fetchDetails();
  }, [filters, activeTab, fetchOverview, fetchPersonal, fetchAlerts, fetchDetails]);

  // Restablecer todos los filtros
  const handleResetFilters = () => {
    setFilters({
      filtro_ebs: 'Todas',
      convenionombre: ['Todas'],
      estado_cita: ['Todas'],
      estado_consulta: ['Todas'],
      especialidad: ['Todas'],
      mediconombre: ['Todas'],
      pym: ['Todas'],
      sede: ['Todas'],
      tipocita: ['Todas'],
      nombrecompleto: '',
      fechacita_inicio: '',
      fechacita_fin: '',
      fechadeseada_inicio: '',
      fechadeseada_fin: '',
      fechaasignacion_inicio: '',
      fechaasignacion_fin: '',
      fechaatencion_inicio: '',
      fechaatencion_fin: '',
      solo_alertas: false,
    });
    setDetailSearch('');
    setDetailSortBy('');
    setDetailSortOrder('asc');
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReloadInitial = async () => {
    await apiFetch('/api/upload/reload-initial', { method: 'POST' });
    fetchDatasetInfo();
    fetchFilters();
    fetchOverview();
    if (activeTab === 'personal') fetchPersonal();
    if (activeTab === 'alerts') fetchAlerts();
    if (activeTab === 'details') fetchDetails();
  };

  const handleUploadSuccess = () => {
    fetchDatasetInfo();
    fetchFilters();
    fetchOverview();
    if (activeTab === 'personal') fetchPersonal();
    if (activeTab === 'alerts') fetchAlerts();
    if (activeTab === 'details') fetchDetails();
  };

  const hasData = overviewData?.total_records_count > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-x-hidden">
      
      {/* Header Principal Nexosalud */}
      <Header
        activeTab={activeTab}
        setActiveTab={(t: any) => setActiveTab(t)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        datasetInfo={datasetInfo}
        onReloadInitial={handleReloadInitial}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Tarjetas KPI Superiores */}
        <KPICards kpis={overviewData?.kpis} />

        {/* Layout Grid: Sidebar de Filtros + Área de Contenido */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          
          {/* Sidebar de Filtros con anchos fijos flex-shrink-0 */}
          <FiltersSidebar
            filtersOptions={filtersOptions}
            selectedFilters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            isMobileOpen={isMobileSidebarOpen}
            activeTab={activeTab}
          />

          {/* Área de Visualización (min-w-0 previene deformación de ancho) */}
          <div className="flex-1 min-w-0 w-full space-y-5">
            
            {loading ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Procesando información del insumo...</p>
              </div>
            ) : !hasData ? (
              /* Estado Vacío - Esperando Insumo */
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/60 rounded-full flex items-center justify-center mx-auto text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                  <FileSpreadsheet className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No hay información cargada actualmente</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                    Para visualizar los gráficos y reportes, presiona el botón <strong>Cargar Insumo</strong> y sube tu archivo CSV o Excel.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Seleccionar Archivo de Insumo</span>
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'general' && (
                  <GeneralCharts chartsData={overviewData?.charts} />
                )}

                {activeTab === 'personal' && (
                  <PersonalAnalysis personalData={personalData} />
                )}

                {activeTab === 'alerts' && (
                  <AlertsModule alerts={alertsData} />
                )}

                {activeTab === 'details' && (
                  <DetailsTable
                    detailsData={detailsData}
                    page={detailPage}
                    setPage={setDetailPage}
                    search={detailSearch}
                    setSearch={setDetailSearch}
                    sortBy={detailSortBy}
                    setSortBy={setDetailSortBy}
                    sortOrder={detailSortOrder}
                    setSortOrder={setDetailSortOrder}
                    filters={filters}
                  />
                )}
              </>
            )}

          </div>
        </div>

      </main>

      {/* Modal Importador de Insumos */}
      <DataImporterModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3.5 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <span>ESE NORTE 3 &copy; {new Date().getFullYear()} - Nexosalud Analítica</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Desarrollado para seguimiento y control asistencial</span>
        </div>
      </footer>

    </div>
  );
}
