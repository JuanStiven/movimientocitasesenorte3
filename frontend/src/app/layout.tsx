import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ESE NORTE 3 - Dashboard de Analítica de Citas',
  description: 'Sistema de analítica, seguimiento de movimiento de citas médicas e importación de insumos para ESE NORTE 3',
};

import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-100 text-slate-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
