import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const activeOrgId = cookies().get('activeOrgId')?.value;
  if (!activeOrgId) {
    redirect('/select-org');
  }

  redirect('/dashboard');
}
