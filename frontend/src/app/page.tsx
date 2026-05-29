'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (hydrated && user) router.replace('/dashboard');
  }, [hydrated, user, router]);

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold tracking-tight">SYNC</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Real-time collaborative project management. Plan work, ship faster, see updates instantly.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">Create account</Link>
        </Button>
      </div>
    </main>
  );
}
