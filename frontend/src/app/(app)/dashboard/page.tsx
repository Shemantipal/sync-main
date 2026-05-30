'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { apiRaw } from '@/lib/api';
import { CreateProjectDialog } from '@/components/create-project-dialog';
import { formatDistanceToNow } from 'date-fns';
import type { Project } from '@/lib/types';

type Tab = 'active' | 'archived';
type Member = string | { name?: string; email?: string; _id?: string };

export default function DashboardPage() {
  const [items, setItems] = useState<Project[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState<Tab>('active');

  useEffect(() => {
    let alive = true;
    setItems(null);
    (async () => {
      const res = await apiRaw<Project[]>(`/api/projects?status=${tab}`);
      if (alive) setItems(res.data);
    })().catch(() => alive && setItems([]));
    return () => { alive = false; };
  }, [refreshKey, tab]);

  const activeCount  = items?.filter((p) => p.status === 'active').length ?? 0;
  const memberSet    = items ? new Set(items.flatMap((p) => p.members)).size : 0;
  const lastUpdated  = items?.length
    ? formatDistanceToNow(
        new Date(Math.max(...items.map((p) => new Date(p.updatedAt).getTime()))),
        { addSuffix: false },
      )
    : '—';

  return (
    <div className="space-y-7">

      
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[19px] font-semibold tracking-[-0.03em] text-[#0a0a0a]">
            Your projects
          </h1>
          <p className="mt-0.5 text-xs font-light text-[#888]">
            Where teams stop losing track.
          </p>
        </div>
        {tab === 'active' && (
          <CreateProjectDialog onCreated={() => setRefreshKey((k) => k + 1)}>
            <button className="flex items-center gap-1.5 rounded-[7px] bg-[#0a0a0a] px-3.5 py-[7px] text-xs font-medium text-white transition-opacity hover:opacity-80">
              <Plus className="h-3.5 w-3.5" />
              New project
            </button>
          </CreateProjectDialog>
        )}
      </div>

      {/* Stats — only on active tab */}
      {tab === 'active' && (
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Active',  value: String(activeCount) },
            { label: 'Members', value: String(memberSet)   },
            { label: 'Updated', value: lastUpdated         },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-[10px] border border-[#e8e8e8] bg-[#f5f5f5] px-4 py-3.5"
            >
              <p className="mb-1.5 text-[11px] font-normal uppercase tracking-[0.04em] text-[#888]">
                {label}
              </p>
              <p className="text-[22px] font-semibold leading-none tracking-[-0.03em] text-[#0a0a0a]">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab toggle */}
      <div className="flex items-center gap-1 rounded-[8px] border border-[#e8e8e8] bg-[#f5f5f5] p-1 w-fit">
        {(['active', 'archived'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-[6px] px-3.5 py-1.5 text-[12px] font-medium capitalize transition-all ${
              tab === t
                ? 'bg-white text-[#0a0a0a] shadow-sm border border-[#e8e8e8]'
                : 'text-[#888] hover:text-[#555]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Section label */}
      <p className="text-[11px] font-normal uppercase tracking-[0.06em] text-[#aaa]">
        {tab === 'active' ? 'Active projects' : 'Archived projects'}
      </p>

      {/* States */}
      {items === null ? (
        <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[130px] animate-pulse rounded-[10px] bg-[#f5f5f5]" />
          ))}
        </div>

      ) : items.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[#e0e0e0] px-8 py-10 text-center">
          <p className="text-[13px] font-medium text-[#888]">
            {tab === 'active' ? 'No active projects yet' : 'No archived projects'}
          </p>
          <p className="mt-1 text-xs font-light text-[#bbb]">
            {tab === 'active'
              ? 'Create your first project to start collaborating.'
              : 'Archived projects will appear here.'}
          </p>
        </div>

      ) : (
        <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const members = p.members as Member[];
            const visible  = members.slice(0, 3);
            const overflow = members.length - 3;

            return (
              <Link
                key={p._id}
                href={`/projects/${p._id}`}
                className={`flex flex-col gap-2.5 rounded-[10px] border bg-white p-4 transition-all hover:bg-[#fafafa] ${
                  tab === 'archived'
                    ? 'border-[#e8e8e8] opacity-70 hover:opacity-100'
                    : 'border-[#e8e8e8] hover:border-[#c0c0c0]'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate text-[13px] font-medium leading-snug tracking-[-0.02em] text-[#0a0a0a]">
                    {p.name}
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-[7px] py-[2px] text-[10px] font-normal ${
                      p.status === 'active'
                        ? 'border-[#9FE1CB] bg-[#e6f5ee] text-[#0f6e56]'
                        : 'border-[#d0d0d0] bg-[#f5f5f5] text-[#888]'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Description */}
                <p className="line-clamp-2 text-[11.5px] font-light leading-[1.55] text-[#888]">
                  {p.description || 'No description yet.'}
                </p>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex">
                    {visible.map((m, i) => (
                      <div
                        key={i}
                        style={{ marginLeft: i === 0 ? 0 : -5 }}
                        className="flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] border-white bg-[#e8e8e8] text-[7px] font-medium text-[#555]"
                      >
                        {(typeof m === 'string' ? m : (m.name ?? m.email ?? '??'))
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    ))}
                    {overflow > 0 && (
                      <div
                        style={{ marginLeft: -5 }}
                        className="flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] border-white bg-[#e8e8e8] text-[7px] font-medium text-[#888]"
                      >
                        +{overflow}
                      </div>
                    )}
                  </div>
                  <span className="text-[10.5px] font-light text-[#bbb]">
                    {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}