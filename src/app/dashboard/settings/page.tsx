import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { SettingsClient } from './SettingsClient';
import { getOrganization, getOrganizationMembers } from '@/actions/settings';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const orgId = cookies().get('activeOrgId')?.value;
  if (!orgId) {
    notFound();
  }

  const membership = await prisma.usuarioOrganizacion.findUnique({
    where: {
      usuarioId_organizacionId: {
        usuarioId: session.user.id,
        organizacionId: orgId,
      },
    },
  });

  if (!membership) {
    notFound();
  }

  const organization = await getOrganization();
  const members = await getOrganizationMembers();

  if (!organization) {
    notFound();
  }

  return (
    <SettingsClient
      organization={{
        id: organization.id,
        nombre: organization.nombre,
        tipo: organization.tipo,
      }}
      members={members}
      currentUserId={session.user.id}
      currentUserRole={membership.rol}
    />
  );
}
