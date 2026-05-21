'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Laptop, Monitor, Printer, Smartphone, HelpCircle, Eye, Trash2, SlidersHorizontal, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteEquipo } from '@/actions/equipos';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToCSV } from '@/lib/export';

interface FuncionarioRef {
  id: string;
  nombre: string;
}

interface Equipo {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  serial: string | null;
  ip: string | null;
  mac: string | null;
  estado: 'ACTIVO' | 'BODEGA' | 'BAJA';
  funcionario: FuncionarioRef | null;
}

interface EquiposClientProps {
  initialEquipos: Equipo[];
}

// Helper to get device icons
function getDeviceIcon(tipo: string) {
  const t = tipo.toLowerCase();
  if (t.includes('pc') || t.includes('desktop') || t.includes('computador')) return Laptop;
  if (t.includes('notebook') || t.includes('laptop') || t.includes('portátil')) return Laptop;
  if (t.includes('monitor') || t.includes('pantalla')) return Monitor;
  if (t.includes('impresora') || t.includes('printer')) return Printer;
  if (t.includes('teléfono') || t.includes('celular') || t.includes('móvil') || t.includes('phone')) return Smartphone;
  return HelpCircle;
}

export function EquiposClient({ initialEquipos }: EquiposClientProps) {
  const [equipos, setEquipos] = React.useState<Equipo[]>(initialEquipos);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL');
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  // Extract unique types for type filter dropdown
  const uniqueTypes = React.useMemo(() => {
    const types = new Set<string>();
    equipos.forEach((e) => {
      if (e.tipo) types.add(e.tipo);
    });
    return Array.from(types);
  }, [equipos]);

  // Filter list
  const filteredEquipos = React.useMemo(() => {
    let result = equipos;

    // Search term
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(
        (e) =>
          e.tipo.toLowerCase().includes(term) ||
          (e.marca && e.marca.toLowerCase().includes(term)) ||
          (e.modelo && e.modelo.toLowerCase().includes(term)) ||
          (e.serial && e.serial.toLowerCase().includes(term)) ||
          (e.ip && e.ip.toLowerCase().includes(term)) ||
          (e.mac && e.mac.toLowerCase().includes(term)) ||
          (e.funcionario && e.funcionario.nombre.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((e) => e.estado === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      result = result.filter((e) => e.tipo === typeFilter);
    }

    return result;
  }, [equipos, searchTerm, statusFilter, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este equipo del inventario?')) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteEquipo(id);
    setIsDeleting(null);

    if (result.success) {
      setEquipos((prev) => prev.filter((e) => e.id !== id));
    } else {
      alert(result.error || 'Error al eliminar equipo');
    }
  };

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Filtros y Controles */}
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por marca, modelo, S/N, IP, responsable..."
              className="pl-9 bg-muted/30 border-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:inline-block" />
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
                <SelectTrigger className="w-full sm:w-[150px] bg-muted/30">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los Estados</SelectItem>
                  <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                  <SelectItem value="BODEGA">BODEGA</SelectItem>
                  <SelectItem value="BAJA">BAJA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || 'ALL')}>
              <SelectTrigger className="w-full sm:w-[150px] bg-muted/30">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los Tipos</SelectItem>
                {uniqueTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(() => {
              const handleExportCSV = () => {
                exportToCSV(
                  filteredEquipos,
                  [
                    { header: 'Tipo', key: 'tipo' },
                    { header: 'Marca', key: 'marca' },
                    { header: 'Modelo', key: 'modelo' },
                    { header: 'Número de Serie', key: 'serial' },
                    { header: 'Dirección IP', key: 'ip' },
                    { header: 'Dirección MAC', key: 'mac' },
                    { header: 'Estado', key: 'estado' },
                    { header: 'Responsable', key: (eq) => eq.funcionario?.nombre || 'Sin asignar' },
                  ],
                  'equipos'
                );
              };

              return (
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto gap-2 border-muted"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              );
            })()}

            <Link href="/dashboard/equipos/nuevo" className="w-full sm:w-auto">
              <Button className="w-full gap-2 shadow-md hover:shadow-lg transition-all">
                <Laptop className="h-4 w-4" />
                Nuevo Equipo
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-lg border border-muted/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-foreground">Equipo</TableHead>
                <TableHead className="font-semibold text-foreground">S/N</TableHead>
                <TableHead className="font-semibold text-foreground">Red & Conectividad</TableHead>
                <TableHead className="font-semibold text-foreground">Responsable</TableHead>
                <TableHead className="font-semibold text-foreground">Estado</TableHead>
                <TableHead className="w-[120px] text-right font-semibold text-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No se encontraron equipos en el inventario.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEquipos.map((eq) => {
                  const DeviceIcon = getDeviceIcon(eq.tipo);
                  return (
                    <TableRow key={eq.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg text-primary/85">
                            <DeviceIcon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {eq.marca || ''} {eq.modelo || ''}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {eq.tipo}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">
                          {eq.serial || 'Sin S/N'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs font-mono">
                          {eq.ip && (
                            <span className="text-foreground">IP: {eq.ip}</span>
                          )}
                          {eq.mac && (
                            <span className="text-muted-foreground text-[10px]">MAC: {eq.mac}</span>
                          )}
                          {!eq.ip && !eq.mac && (
                            <span className="text-muted-foreground italic font-sans text-xs">Sin datos</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {eq.funcionario ? (
                          <Link 
                            href={`/dashboard/funcionarios/${eq.funcionario.id}`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            {eq.funcionario.nombre}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={`text-[10px] font-bold px-2 py-0.5 ${
                            eq.estado === 'ACTIVO' 
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                              : eq.estado === 'BODEGA'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {eq.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/dashboard/equipos/${eq.id}`}>
                            <Button variant="ghost" size="icon-sm" className="hover:bg-primary/10 hover:text-primary">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Detalles</span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                            disabled={isDeleting === eq.id}
                            onClick={() => handleDelete(eq.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
