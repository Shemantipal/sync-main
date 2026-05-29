'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { apiRaw } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CreateProjectDialog } from '@/components/create-project-dialog';
import type { Project } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const [items, setItems] = useState<Project[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await apiRaw<Project[]>('/api/projects?status=active');
      if (alive) setItems(res.data);
    })().catch(() => alive && setItems([]));
    return () => { alive = false; };
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your projects</h1>
          <p className="text-sm text-muted-foreground">
            Real-time collaboration across every project you&apos;re a part of.
          </p>
        </div>
        <CreateProjectDialog onCreated={() => setRefreshKey((k) => k + 1)}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New project
          </Button>
        </CreateProjectDialog>
      </div>

      {items === null ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>Create your first project to start collaborating.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link key={p._id} href={`/projects/${p._id}`} className="block">
              <Card className="h-full transition hover:border-foreground/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="line-clamp-1">{p.name}</CardTitle>
                    <Badge variant={p.status === 'active' ? 'secondary' : 'outline'}>
                      {p.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {p.description || 'No description yet.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{p.members.length} member{p.members.length === 1 ? '' : 's'}</span>
                  <span>Updated {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
