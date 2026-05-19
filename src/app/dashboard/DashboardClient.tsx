'use client';

import * as React from 'react';
import { Users, Laptop, Package, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  counts: {
    funcionarios: number;
    equipos: number;
    insumos: number;
  };
  equiposPorEstado: {
    ACTIVO: number;
    BODEGA: number;
    BAJA: number;
  };
  equiposPorTipo: {
    name: string;
    value: number;
  }[];
  insumosCriticos: {
    id: string;
    nombre: string;
    stockActual: number;
    stockMinimo: number;
    tipo: string | null;
  }[];
  insumosChartData: {
    nombre: string;
    stockActual: number;
    stockMinimo: number;
  }[];
}

interface DashboardClientProps {
  data: DashboardData;
}

export function DashboardClient({ data }: DashboardClientProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Data for PieChart
  const pieData = [
    { name: 'Activos (En uso)', value: data.equiposPorEstado.ACTIVO, color: '#10b981' }, // Green
    { name: 'En Bodega', value: data.equiposPorEstado.BODEGA, color: '#f59e0b' },      // Amber
    { name: 'Baja / Retirados', value: data.equiposPorEstado.BAJA, color: '#ef4444' }, // Red
  ].filter(d => d.value > 0); // Only show statuses with items

  if (!isMounted) {
    return (
      <div className="space-y-6">
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border border-border bg-card/60">
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse border border-border bg-card/60">
            <CardContent className="h-80" />
          </Card>
          <Card className="animate-pulse border border-border bg-card/60">
            <CardContent className="h-80" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Funcionarios
            </CardTitle>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-extrabold text-foreground">
              {data.counts.funcionarios}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Personal registrado en el directorio corporativo
            </p>
            <div className="mt-4 flex items-center">
              <Link href="/dashboard/funcionarios" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Ver directorio <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Equipos TI
            </CardTitle>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Laptop className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-extrabold text-foreground">
              {data.counts.equipos}
            </div>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-green-500 font-bold">
                {data.equiposPorEstado.ACTIVO} Activos
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-amber-500 font-bold">
                {data.equiposPorEstado.BODEGA} Bodega
              </span>
            </div>
            <div className="mt-4 flex items-center">
              <Link href="/dashboard/equipos" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Ver inventario <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Insumos & Repuestos
            </CardTitle>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Package className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-extrabold text-foreground">
              {data.counts.insumos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Categorías de consumibles y repuestos
            </p>
            <div className="mt-4 flex items-center">
              <Link href="/dashboard/insumos" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Ver insumos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Datos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico 1: Distribucion Equipos */}
        <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Estado de Equipos</CardTitle>
            <CardDescription>
              Proporción de hardware en uso, almacenamiento o retirados.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-72">
            {pieData.length === 0 ? (
              <span className="text-sm text-muted-foreground">Sin datos de equipos disponibles.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Grafico 2: Stock de Insumos */}
        <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Niveles de Stock de Insumos</CardTitle>
            <CardDescription>
              Comparativa entre stock actual y el límite mínimo recomendado.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {data.insumosChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No hay insumos registrados para graficar.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.insumosChartData}
                  margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="nombre" tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 10 }} />
                  <YAxis tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="stockActual" name="Stock Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stockMinimo" name="Mínimo Requerido" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Stock Crítico */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="border-b border-muted/50 bg-muted/20">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <div>
                <CardTitle className="text-lg font-bold">Alertas de Stock Crítico</CardTitle>
                <CardDescription>
                  Insumos y repuestos con stock por debajo del límite mínimo establecido.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.insumosCriticos.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                ¡Excelente! Todos los insumos tienen niveles de stock saludables.
              </div>
            ) : (
              <div className="divide-y divide-muted/50">
                {data.insumosCriticos.map((i) => (
                  <div key={i.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{i.nombre}</h4>
                        <p className="text-xs text-muted-foreground">{i.tipo || 'Sin Tipo'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-bold text-red-600 dark:text-red-400">
                          {i.stockActual} unidades
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Mínimo: {i.stockMinimo}
                        </div>
                      </div>
                      <Link href={`/dashboard/insumos/${i.id}`}>
                        <Button size="sm" variant="outline">
                          Reabastecer
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
