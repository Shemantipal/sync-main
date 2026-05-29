'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function AcceptInvitationInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState<'pending' | 'error'>('pending');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing invitation token');
      return;
    }

    const acceptInvite = async () => {
      try {
        const result = await api<{ projectId: string }>('/api/projects/accept-invite', {
          method: 'POST',
          body: { token },
        });

        toast.success('Invitation accepted');
        router.replace(`/projects/${result.projectId}`);
      } catch (err) {
        const errorMessage = (err as Error).message;

        // User is not logged in / token missing / unauthorized
        if (
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('not authenticated') ||
          errorMessage.toLowerCase().includes('login') ||
          errorMessage.toLowerCase().includes('token')
        ) {
          router.replace(
            `/login?next=${encodeURIComponent(`/invitations/accept?token=${token}`)}`
          );
          return;
        }

        setStatus('error');
        setMessage(errorMessage);
      }
    };

    acceptInvite();
  }, [token, router]);

  return (
    <main className="container flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === 'pending' ? 'Accepting invitation…' : 'Invitation problem'}
          </CardTitle>
          <CardDescription>
            {status === 'pending'
              ? 'Checking your invitation and redirecting you.'
              : message}
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </main>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="container py-10">Loading…</div>}>
      <AcceptInvitationInner />
    </Suspense>
  );
}