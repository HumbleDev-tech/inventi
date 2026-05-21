'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, UserPlus, Phone, Mail, FileText, Trash2, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteFuncionario } from '@/actions/funcionarios';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { exportToCSV } from '@/lib/export';

interface Funcionario {
  id: string;
  nombre: string;
  rut: string | null;
  cargo: string | null;
  departamento: string | null;
  telefono: string | null;
  email: string | null;
}

interface FuncionariosClientProps {
  initialFuncionarios: Funcionario[];
}

export function FuncionariosClient({ initialFuncionarios }: FuncionariosClientProps) {
  const [funcionarios, setFuncionarios] = React.useState<Funcionario[]>(initialFuncionarios);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  // Filtrar localmente por búsqueda
  const filteredFuncionarios = React.useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return funcionarios;
    return funcionarios.filter(
      (f) =>
        f.nombre.toLowerCase().includes(term) ||
        (f.rut && f.rut.toLowerCase().includes(term)) ||
        (f.departamento && f.departamento.toLowerCase().includes(term)) ||
        (f.cargo && f.cargo.toLowerCase().includes(term))
    );
  }, [funcionarios, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este funcionario? Sus equipos asignados quedarán sin responsable.')) {
      return;
    }
    
    setIsDeleting(id);
    const result = await deleteFuncionario(id);
    setIsDeleting(null);

    if (result.success) {
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
    } else {
      alert(result.error || 'Error al eliminar funcionario');
    }
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredFuncionarios,
      [
        { header: 'Nombre', key: 'nombre' },
        { header: 'RUT', key: 'rut' },
        { header: 'Cargo', key: 'cargo' },
        { header: 'Departamento', key: 'departamento' },
        { header: 'Teléfono', key: 'telefono' },
        { header: 'Email', key: 'email' },
      ],
      'funcionarios'
    );
  };

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, RUT, departamento..."
              className="pl-9 bg-muted/30 border-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              type="button"
              onClick={handleExportCSV}
              className="w-full sm:w-auto gap-2 border-muted"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Link href="/dashboard/funcionarios/nuevo" className="w-full sm:w-auto">
              <Button className="w-full gap-2 shadow-md hover:shadow-lg transition-all">
                <UserPlus className="h-4 w-4" />
                Nuevo Funcionario
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-muted/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-foreground">Nombre / RUT</TableHead>
                <TableHead className="font-semibold text-foreground">Cargo / Departamento</TableHead>
                <TableHead className="font-semibold text-foreground">Contacto</TableHead>
                <TableHead className="w-[120px] text-right font-semibold text-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFuncionarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No se encontraron funcionarios.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFuncionarios.map((f) => (
                  <TableRow key={f.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{f.nombre}</span>
                        <span className="text-xs text-muted-foreground">{f.rut || 'Sin RUT'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{f.cargo || 'Sin Cargo'}</span>
                        {f.departamento ? (
                          <div className="mt-1">
                            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary">
                              {f.departamento}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin Departamento</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {f.email && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3 w-3 text-primary/75" />
                            <span className="truncate max-w-[180px]">{f.email}</span>
                          </div>
                        )}
                        {f.telefono && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3 w-3 text-primary/75" />
                            <span>{f.telefono}</span>
                          </div>
                        )}
                        {!f.email && !f.telefono && (
                          <span className="text-muted-foreground italic">Sin datos</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/dashboard/funcionarios/${f.id}`}>
                          <Button variant="ghost" size="icon-sm" className="hover:bg-primary/10 hover:text-primary">
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Detalles</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                          disabled={isDeleting === f.id}
                          onClick={() => handleDelete(f.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
