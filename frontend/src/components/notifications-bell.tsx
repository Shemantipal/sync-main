'use client';
import { Bell } from 'lucide-react';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useNotifications } from '@/store/notifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/store/auth';
import { formatDistanceToNow } from 'date-fns';

export function NotificationsBell() {
  const items = useNotifications((s) => s.items);
  const unread = useNotifications((s) => s.unread);
  const setAll = useNotifications((s) => s.setAll);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (!hydrated || !user) return;
    (async () => {
      try {
        const res = await api<any>('/api/notifications?limit=30');
        // raw response has { data, meta }; api() unwraps data — so res is the array.
        setAll(Array.isArray(res) ? res : res?.data ?? [], 0);
      } catch {
        /* ignore */
      }
    })();
  }, [hydrated, user, setAll]);

  const handleOpenChange = async (open: boolean) => {
    if (open && unread > 0) {
      await api('/api/notifications/mark-read', { method: 'POST', body: { ids: [] } }).catch(() => null);
      markAllRead();
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {items.length === 0 ? (
          <DropdownMenuItem disabled>No notifications yet</DropdownMenuItem>
        ) : (
          items.slice(0, 10).map((n) => (
            <DropdownMenuItem key={n._id} className="flex flex-col items-start gap-0.5">
              <span className="text-sm">{n.message}</span>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          Real-time — updates appear instantly
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
