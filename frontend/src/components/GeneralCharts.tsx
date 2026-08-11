'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Layers } from 'lucide-react';

interface GeneralChartsProps {
  chartsData?: {
    estado_cita: any[];
    estado_consulta: any[];
    citas_finalidad: any[];
    clasificacion_citas: any[];
    tipo_cita: any[];
    citas_periodo: any[];
  };
}

// Paleta Institucional ESE NORTE 3 / Nexosalud (Tonos Azules, Marinos y Pizarra)
const INSTITUTIONAL_COLORS = [
  '#005696', // Azul Institucional Principal
  '#004884', // Azul Marino
  '#0284c7', // Azul Corporativo Medio
  '#38bdf8', // Azul Claro Accent
  '#0f172a', // Azul Noche Slate
  '#475569', // Pizarra
  '#64748b', // Gris Pizarra Medio
  '#94a3b8', // Gris Claro
];

export const GeneralCharts: React.FC<GeneralChartsProps> = ({ chartsData }) => {
  const estadoCita = chartsData?.estado_cita || [];
  const estadoConsulta = chartsData?.estado_consulta || [];
  const finalidad = chartsData?.citas_finalidad || [];
  const clasificacion = chartsData?.clasificacion_citas || [];
  const periodo = chartsData?.citas_periodo || [];

  return (
    <div className="space-y-5">
      
      {/* Fila 1: Gráficos de Estado Cita y Estado Consulta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Gráfico 1: Estado Cita */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                CITAS POR ESTADO (estado_cita)
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Distribución</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estadoCita} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Citas" radius={[6, 6, 0, 0]}>
                  {estadoCita.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={INSTITUTIONAL_COLORS[index % INSTITUTIONAL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Estado Consulta */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                ESTADO DE CONSULTA (estado_consulta)
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Proporción</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={estadoConsulta}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {estadoConsulta.map((_, index) => (
                    <Cell key={`cell-pie-${index}`} fill={INSTITUTIONAL_COLORS[index % INSTITUTIONAL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Fila 2: Tendencia por Período */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              TENDENCIA DE CITAS POR PERÍODO (MENSUAL)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Histórico</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={periodo} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#005696" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#005696" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="ACTIVO" name="Activas" stroke="#005696" fillOpacity={1} fill="url(#colorCitas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fila 3: Citas por Finalidad y Clasificación PYM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Gráfico 3: Finalidad */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                TOP CITAS POR FINALIDAD
              </h3>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={finalidad} margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Citas" fill="#005696" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 4: Clasificación PYM */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                DISTRIBUCIÓN POR PROGRAMA / PYM
              </h3>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={clasificacion} margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Citas" fill="#004884" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
