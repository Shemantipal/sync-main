'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api, apiRaw } from '@/lib/api';
import { joinProject, leaveProject } from '@/lib/socket';
import { useTasks } from '@/store/tasks';
import type { Project, Task, Role } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KanbanBoard } from '@/components/kanban-board';
import { TaskFilters, type TaskFilterState } from '@/components/task-filters';
import { ProjectMembersPanel } from '@/components/project-members-panel';
import { ProjectActivityPanel } from '@/components/project-activity-panel';
import { useAuth } from '@/store/auth';

// Stable empty reference — Zustand selectors must return the same object identity
// across renders when the underlying state hasn't changed, or React's
// useSyncExternalStore loops. Inlining `?? {}` would allocate fresh objects.
const EMPTY_TASK_MAP: Record<string, Task> = {};

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState<TaskFilterState>({ search: '', status: 'all', priority: 'all', sort: '-updatedAt' });
  const setMany = useTasks((s) => s.setMany);
  const tasksMap = useTasks((s) => s.byProject[projectId] ?? EMPTY_TASK_MAP);
  const me = useAuth((s) => s.user);

  // Join project room on mount, leave on unmount — pure realtime lifecycle.
  useEffect(() => {
    joinProject(projectId);
    return () => { leaveProject(projectId); };
  }, [projectId]);

  // Load project meta.
  useEffect(() => {
    let alive = true;
    (async () => {
      const p = await api<Project>(`/api/projects/${projectId}`);
      if (alive) setProject(p);
    })();
    return () => { alive = false; };
  }, [projectId]);

  // Load tasks whenever filters change. Debounced search lives in TaskFilters.
  useEffect(() => {
    let alive = true;
    (async () => {
      const qs = new URLSearchParams();
      if (filters.search) qs.set('search', filters.search);
      if (filters.status !== 'all') qs.set('status', filters.status);
      if (filters.priority !== 'all') qs.set('priority', filters.priority);
      qs.set('sort', filters.sort);
      qs.set('limit', '100');
      const res = await apiRaw<Task[]>(`/api/projects/${projectId}/tasks?${qs.toString()}`);
      if (alive) setMany(projectId, res.data);
    })();
    return () => { alive = false; };
  }, [projectId, filters, setMany]);

  if (!project) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const myRole: Role | undefined = me
    ? typeof project.owner === 'string'
      ? undefined
      : project.owner._id === me._id
        ? 'admin'
        : project.members.find((m) => m.user._id === me._id)?.role
    : undefined;
  const canManage = myRole === 'admin';
  const canEdit = myRole === 'admin' || myRole === 'member';

  const tasks = Object.values(tasksMap);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
            <Link href="/dashboard"><ArrowLeft className="mr-1 h-4 w-4" /> Dashboard</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
        <Badge variant={project.status === 'active' ? 'secondary' : 'outline'}>{project.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <TaskFilters value={filters} onChange={setFilters} />
          <KanbanBoard
            projectId={projectId}
            tasks={tasks}
            members={project.members}
            canEdit={canEdit}
            canDelete={canManage}
          />
        </div>
        <div className="space-y-6">
          <ProjectMembersPanel project={project} canManage={canManage} onUpdated={setProject} />
          <ProjectActivityPanel projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
