'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Building, Users, Shield, Trash2, UserPlus, Save, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  updateOrganization, 
  updateMemberRole, 
  addMemberByEmail, 
  removeMember 
} from '@/actions/settings';

interface Organization {
  id: string;
  nombre: string;
  tipo: string | null;
}

interface Member {
  usuarioId: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'TECNICO' | 'USUARIO';
}

interface SettingsClientProps {
  organization: Organization;
  members: Member[];
  currentUserId: string;
  currentUserRole: string;
}

export function SettingsClient({ 
  organization, 
  members, 
  currentUserId, 
  currentUserRole 
}: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'org' | 'members'>('org');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // State for invite form
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'ADMIN' | 'TECNICO' | 'USUARIO'>('USUARIO');
  const [isInviting, setIsInviting] = React.useState(false);

  const isAdmin = currentUserRole === 'ADMIN';

  // Org form
  const {
    register: registerOrg,
    handleSubmit: handleSubmitOrg,
    formState: { errors: orgErrors },
  } = useForm({
    defaultValues: {
      nombre: organization.nombre || '',
      tipo: organization.tipo || '',
    },
  });

  const onSubmitOrg = async (data: { nombre: string; tipo: string }) => {
    if (!isAdmin) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await updateOrganization(data.nombre, data.tipo);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess('Configuración de organización actualizada.');
      router.refresh();
    } else {
      setError(result.error || 'Ocurrió un error.');
    }
  };

  const handleRoleChange = async (usuarioId: string, newRole: 'ADMIN' | 'TECNICO' | 'USUARIO') => {
    if (!isAdmin) return;
    setError(null);
    setSuccess(null);

    const result = await updateMemberRole(usuarioId, newRole);
    if (result.success) {
      setSuccess('Rol de miembro actualizado con éxito.');
      router.refresh();
    } else {
      setError(result.error || 'Error al actualizar el rol.');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setError(null);
    setSuccess(null);

    const result = await addMemberByEmail(inviteEmail, inviteRole);
    setIsInviting(false);

    if (result.success) {
      setSuccess(`Miembro "${result.nombre || inviteEmail}" añadido a la organización.`);
      setInviteEmail('');
      router.refresh();
    } else {
      setError(result.error || 'Error al añadir miembro.');
    }
  };

  const handleRemoveMember = async (usuarioId: string, nombre: string) => {
    if (!isAdmin) return;
    if (usuarioId === currentUserId) return;

    if (!confirm(`¿Estás seguro de que deseas remover a ${nombre} de esta organización?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    const result = await removeMember(usuarioId);
    if (result.success) {
      setSuccess(`Miembro "${nombre}" removido con éxito.`);
      router.refresh();
    } else {
      setError(result.error || 'Error al remover miembro.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Configuración
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra la información de tu hospital/organización y gestiona los accesos de los miembros del equipo.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => { setActiveTab('org'); setError(null); setSuccess(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 -mb-[2px] transition-all ${
            activeTab === 'org'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building className="h-4 w-4" />
          Organización
        </button>
        <button
          onClick={() => { setActiveTab('members'); setError(null); setSuccess(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 -mb-[2px] transition-all ${
            activeTab === 'members'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Miembros ({members.length})
        </button>
      </div>

      {/* Feedback Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Tab: Organization */}
      {activeTab === 'org' && (
        <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="border-b border-muted/50 bg-muted/20">
            <CardTitle className="text-xl font-bold">Datos Generales</CardTitle>
            <CardDescription>
              Detalles de la organización activa.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitOrg(onSubmitOrg)}>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre de la Organización / Hospital <span className="text-destructive">*</span></Label>
                <Input
                  id="nombre"
                  className="bg-muted/20"
                  disabled={!isAdmin}
                  {...registerOrg('nombre', { required: 'El nombre es obligatorio' })}
                />
                {orgErrors.nombre && (
                  <span className="text-xs text-destructive">{orgErrors.nombre.message}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo de Institución</Label>
                <select
                  id="tipo"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!isAdmin}
                  {...registerOrg('tipo')}
                >
                  <option value="">No especificado</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clínica">Clínica</option>
                  <option value="Cesfam">Cesfam / SAPU</option>
                  <option value="Empresa">Empresa</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </CardContent>
            {isAdmin && (
              <CardFooter className="border-t border-muted/50 p-6 flex justify-end bg-muted/10">
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </CardFooter>
            )}
          </form>
        </Card>
      )}

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="flex flex-col gap-6">
          {/* Invite form (ADMIN only) */}
          {isAdmin && (
            <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
              <CardHeader className="border-b border-muted/50 bg-muted/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Añadir Miembro
                </CardTitle>
                <CardDescription>
                  Ingresa el correo electrónico de un usuario registrado para añadirlo a la organización.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleInvite}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="grid gap-2 flex-1 w-full">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        className="bg-muted/20"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2 w-full md:w-[200px]">
                      <Label htmlFor="role">Rol</Label>
                      <select
                        id="role"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'TECNICO' | 'USUARIO')}
                      >
                        <option value="USUARIO">Usuario (Lector)</option>
                        <option value="TECNICO">Técnico (Editor)</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>
                    <Button type="submit" disabled={isInviting} className="w-full md:w-auto">
                      {isInviting ? 'Añadiendo...' : 'Añadir'}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          )}

          {/* Members list */}
          <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="border-b border-muted/50 bg-muted/20">
              <CardTitle className="text-lg font-bold">Listado de Miembros</CardTitle>
              <CardDescription>
                Usuarios con acceso a los activos e insumos de esta organización.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">Nombre</TableHead>
                    <TableHead className="font-semibold text-foreground">Correo Electrónico</TableHead>
                    <TableHead className="font-semibold text-foreground w-[200px]">Rol</TableHead>
                    {isAdmin && <TableHead className="w-[100px] text-right font-semibold text-foreground">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const isSelf = member.usuarioId === currentUserId;
                    return (
                      <TableRow key={member.usuarioId} className="hover:bg-muted/15 transition-colors">
                        <TableCell className="font-semibold text-sm">
                          {member.nombre} {isSelf && <span className="text-xs text-muted-foreground font-normal ml-1">(Tú)</span>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          {isSelf || !isAdmin ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              member.rol === 'ADMIN' 
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                                : member.rol === 'TECNICO'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <Shield className="h-3 w-3" />
                              {member.rol}
                            </span>
                          ) : (
                            <select
                              className="flex h-8 w-[160px] rounded-md border border-input bg-background/50 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                              value={member.rol}
                              onChange={(e) => handleRoleChange(member.usuarioId, e.target.value as 'ADMIN' | 'TECNICO' | 'USUARIO')}
                            >
                              <option value="USUARIO">USUARIO (Lector)</option>
                              <option value="TECNICO">TECNICO (Editor)</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            {!isSelf && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                                onClick={() => handleRemoveMember(member.usuarioId, member.nombre)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
