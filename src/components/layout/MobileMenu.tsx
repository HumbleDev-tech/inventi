'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, Users, MonitorSmartphone, Package2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Funcionarios', href: '/dashboard/funcionarios', icon: Users },
  { name: 'Equipos', href: '/dashboard/equipos', icon: MonitorSmartphone },
  { name: 'Insumos', href: '/dashboard/insumos', icon: Package2 },
];

interface MobileMenuProps {
  orgName: string;
}

export function MobileMenu({ orgName }: MobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden mr-2" />}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menú</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col h-full bg-background border-r">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 font-semibold"
            onClick={() => setOpen(false)}
          >
            <MonitorSmartphone className="h-6 w-6 text-primary" />
            <span className="font-bold">InvenTI</span>
          </Link>
        </div>
        <div className="px-4 py-2 border-b bg-muted/40">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Organización Activa
          </span>
          <span className="text-sm font-medium text-primary block truncate">
            {orgName}
          </span>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-2 text-sm font-medium gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
              pathname === '/dashboard/settings' ? "bg-muted text-primary" : "text-muted-foreground"
            )}
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4" />
            Configuración
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
