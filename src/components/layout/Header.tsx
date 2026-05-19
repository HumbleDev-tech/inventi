import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';

export async function Header() {
  const session = await auth();
  const activeOrgId = cookies().get('activeOrgId')?.value;

  let orgName = 'Sin Organización';

  if (activeOrgId) {
    const org = await prisma.organizacion.findUnique({
      where: { id: activeOrgId },
      select: { nombre: true },
    });
    if (org) {
      orgName = org.nombre;
    }
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <MobileMenu orgName={orgName} />
      <div className="w-full flex-1">
        {/* Placeholder for future search or breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden md:inline-block font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
            {orgName}
          </span>
        </div>
      </div>
      <ThemeToggle />
      <UserMenu email={session?.user?.email} name={session?.user?.name} />
    </header>
  );
}
