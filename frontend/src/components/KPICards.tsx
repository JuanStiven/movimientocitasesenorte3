'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock, XCircle, AlertTriangle, Activity } from 'lucide-react';

interface KPICardsProps {
  kpis?: {
    total_citas: number;
    finalizadas: number;
    en_sala: number;
    canceladas: number;
    incumplidas: number;
    alertas_sala: number;
    promedio_dias_espera: number;
  };
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const totalCitas = kpis?.total_citas ?? 0;
  const alertasCount = kpis?.alertas_sala ?? 0;
  const alertasPct = totalCitas > 0 ? ((alertasCount / totalCitas) * 100).toFixed(1) : '0.0';

  const cards = [
    {
      title: 'TOTAL CITAS',
      value: kpis?.total_citas ?? 0,
      subtitle: 'Registros cargados',
      icon: Calendar,
      accent: 'border-l-4 border-primary-600',
      iconBg: 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400',
      badge: null,
    },
    {
      title: 'FINALIZADAS',
      value: kpis?.finalizadas ?? 0,
      subtitle: 'Atenciones completadas',
      icon: CheckCircle2,
      accent: 'border-l-4 border-emerald-600',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400',
      badge: null,
    },
    {
      title: 'EN SALA',
      value: kpis?.en_sala ?? 0,
      subtitle: 'Pacientes en espera',
      icon: Clock,
      accent: 'border-l-4 border-slate-600 dark:border-slate-400',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      badge: null,
    },
    {
      title: 'CANCELADAS / INCUMPLIDAS',
      value: (kpis?.canceladas ?? 0) + (kpis?.incumplidas ?? 0),
      subtitle: `${kpis?.canceladas ?? 0} Canc. | ${kpis?.incumplidas ?? 0} Incumpl.`,
      icon: XCircle,
      accent: 'border-l-4 border-slate-400',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      badge: null,
    },
    {
      title: 'ALERTAS (>3d SALA)',
      value: kpis?.alertas_sala ?? 0,
      subtitle: `${alertasPct}% del total de citas`,
      icon: AlertTriangle,
      accent: 'border-l-4 border-rose-600',
      iconBg: 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
      badge: `${alertasPct}%`,
    },
    {
      title: 'PROM. DÍAS ESPERA',
      value: `${kpis?.promedio_dias_espera ?? 0}d`,
      subtitle: 'Asignación a cita',
      icon: Activity,
      accent: 'border-l-4 border-primary-500',
      iconBg: 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400',
      badge: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white dark:bg-slate-900 rounded-xl p-3.5 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-800 ${card.accent} flex flex-col justify-between transition-colors`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${card.iconBg}`}>
                <IconComponent className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </span>
                {card.badge && (
                  <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
