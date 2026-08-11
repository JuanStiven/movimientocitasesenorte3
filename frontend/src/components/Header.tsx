'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UploadCloud, RefreshCw, AlertTriangle, List, BarChart3, UserCheck, Menu, X, Sun, Moon, LogOut, Users, User } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUploadModal: () => void;
  datasetInfo: any;
  onReloadInitial: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUploadModal,
  datasetInfo,
  onReloadInitial,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isDarkMode,
  setIsDarkMode,
}) => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white dark:bg-slate-950 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">

          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Abrir/Cerrar Filtros"
            >
              {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Container del Logo ESE NORTE 3 */}
            <div className="flex items-center bg-slate-50 dark:bg-white/95 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <img
                src="/logo_es.png"
                alt="Logo ESE NORTE 3"
                className="h-8 w-auto max-w-[130px] sm:max-w-[150px] object-contain"
              />
            </div>
          </div>

          {/* Tab Navigation (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'general'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
                }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Análisis General</span>
            </button>

            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'personal'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
                }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Personal Asistencial</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'alerts'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Alertas Sala</span>
            </button>

            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'details'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
                }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Detalle Citas</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">

            {/* Toggle Modo Claro / Oscuro */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" />
                </>
              )}
            </button>

            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow transition-all active:scale-95"
              title="Cargar archivo de insumo diario"
            >
              <UploadCloud className="h-4 w-4" />
              <span className="hidden sm:inline">Cargar Insumo</span>
            </button>

            <button
              onClick={onReloadInitial}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
              title="Recargar insumo inicial"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* Profile Menu / Logout */}
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
            
            {user && (
              <div className="flex items-center gap-3 ml-1">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.username}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{user.rol}</span>
                </div>
                
                {user.rol === 'ADMIN' && (
                  <Link href="/usuarios" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-primary-600 dark:text-primary-400 transition-all" title="Gestión de Usuarios">
                    <Users className="h-4 w-4" />
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-all"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Navigation Tabs (Mobile) */}
        <div className="flex md:hidden items-center justify-around bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 mt-2.5">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all ${activeTab === 'general' ? 'bg-primary-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all ${activeTab === 'personal' ? 'bg-primary-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
          >
            Asistencial
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all ${activeTab === 'alerts' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
          >
            Alertas
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all ${activeTab === 'details' ? 'bg-primary-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
          >
            Detalle
          </button>
        </div>

      </div>
    </header>
  );
};
