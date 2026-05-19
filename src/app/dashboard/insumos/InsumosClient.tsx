'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Package, Plus, Minus, AlertTriangle, Trash2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteInsumo, adjustInsumoStock } from '@/actions/insumos';
import { Card, CardContent } from '@/components/ui/card';

interface Insumo {
  id: string;
  nombre: string;
  tipo: string | null;
  modelo: string | null;
  stockActual: number;
  stockMinimo: number;
}

interface InsumosClientProps {
  initialInsumos: Insumo[];
}

export function InsumosClient({ initialInsumos }: InsumosClientProps) {
  const [insumos, setInsumos] = React.useState<Insumo[]>(initialInsumos);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [stockFilter, setStockFilter] = React.useState<'ALL' | 'LOW'>('ALL');
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [adjustingId, setAdjustingId] = React.useState<string | null>(null);

  // Filter list
  const filteredInsumos = React.useMemo(() => {
    let result = insumos;

    // Search term
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(
        (i) =>
          i.nombre.toLowerCase().includes(term) ||
          (i.tipo && i.tipo.toLowerCase().includes(term)) ||
          (i.modelo && i.modelo.toLowerCase().includes(term))
      );
    }

    // Low stock filter
    if (stockFilter === 'LOW') {
      result = result.filter((i) => i.stockActual <= i.stockMinimo);
    }

    return result;
  }, [insumos, searchTerm, stockFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este insumo del inventario?')) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteInsumo(id);
    setIsDeleting(null);

    if (result.success) {
      setInsumos((prev) => prev.filter((i) => i.id !== id));
    } else {
      alert(result.error || 'Error al eliminar insumo');
    }
  };

  const handleAdjustStock = async (id: string, amount: number) => {
    setAdjustingId(id);
    const result = await adjustInsumoStock(id, amount);
    setAdjustingId(null);

    if (result.success && result.insumo) {
      const updatedInsumo = result.insumo;
      setInsumos((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                stockActual: updatedInsumo.stockActual,
                stockMinimo: updatedInsumo.stockMinimo,
              }
            : i
        )
      );
    } else {
      alert(result.error || 'Error al ajustar stock');
    }
  };

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, tipo, modelo..."
              className="pl-9 bg-muted/30 border-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant={stockFilter === 'LOW' ? 'destructive' : 'outline'}
              className="w-full sm:w-auto gap-2"
              onClick={() => setStockFilter((prev) => (prev === 'ALL' ? 'LOW' : 'ALL'))}
            >
              <AlertTriangle className="h-4 w-4" />
              {stockFilter === 'LOW' ? 'Mostrar Todos' : 'Ver Stock Bajo'}
            </Button>

            <Link href="/dashboard/insumos/nuevo" className="w-full sm:w-auto">
              <Button className="w-full gap-2 shadow-md hover:shadow-lg transition-all">
                <Plus className="h-4 w-4" />
                Nuevo Insumo
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-muted/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-foreground">Insumo</TableHead>
                <TableHead className="font-semibold text-foreground">Tipo / Modelo</TableHead>
                <TableHead className="font-semibold text-foreground text-center w-[160px]">Stock Mínimo</TableHead>
                <TableHead className="font-semibold text-foreground text-center w-[200px]">Ajuste Rápido de Stock</TableHead>
                <TableHead className="w-[120px] text-right font-semibold text-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsumos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No se encontraron insumos en el inventario.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInsumos.map((i) => {
                  const isLowStock = i.stockActual <= i.stockMinimo;
                  return (
                    <TableRow key={i.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg text-primary/85">
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {i.nombre}
                            </span>
                            {isLowStock && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 mt-0.5">
                                <AlertTriangle className="h-3 w-3" />
                                Crítico: Reabastecer
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="text-foreground font-medium">{i.tipo || 'Sin Tipo'}</span>
                          {i.modelo && (
                            <span className="text-muted-foreground">{i.modelo}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-sm">
                        {i.stockMinimo} und.
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon-xs"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive border-muted"
                            disabled={adjustingId === i.id || i.stockActual <= 0}
                            onClick={() => handleAdjustStock(i.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Reducir</span>
                          </Button>
                          <span
                            className={`w-12 text-center font-bold text-sm px-1.5 py-0.5 rounded ${
                              isLowStock 
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold' 
                                : 'text-foreground'
                            }`}
                          >
                            {i.stockActual}
                          </span>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            className="h-8 w-8 hover:bg-green-500/10 hover:text-green-600 border-muted"
                            disabled={adjustingId === i.id}
                            onClick={() => handleAdjustStock(i.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Aumentar</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/dashboard/insumos/${i.id}`}>
                            <Button variant="ghost" size="icon-sm" className="hover:bg-primary/10 hover:text-primary">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                            disabled={isDeleting === i.id}
                            onClick={() => handleDelete(i.id)}
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
