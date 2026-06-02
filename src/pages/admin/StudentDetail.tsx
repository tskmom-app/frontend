import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Phone, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { StatusBadge, StudentStatusBadge, TrackBadge } from '@/components/shared/Badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { StudentDetail as StudentDetailData, StudentStatus } from '@/types/api';

export function StudentDetail() {
  const { id = '' } = useParams();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => api.get<StudentDetailData>(`/api/admin/students/${id}`),
  });

  const statusMutation = useMutation({
    mutationFn: (status: StudentStatus) =>
      api.patch(`/api/admin/students/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['student', id] });
      qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error('Could not update status'),
  });

  const assignMutation = useMutation({
    mutationFn: () => api.post(`/api/admin/students/${id}/assign`),
    onSuccess: (res) => {
      if (res) {
        toast.success('Next quest assigned & sent on WhatsApp');
        qc.invalidateQueries({ queryKey: ['student', id] });
      } else {
        toast.info('No eligible quests left for this student');
      }
    },
    onError: () => toast.error('Could not assign a quest'),
  });

  const digestMutation = useMutation({
    mutationFn: () => api.post<{ sent: boolean }>(`/api/admin/students/${id}/parent-digest`),
    onSuccess: (res) =>
      res?.sent
        ? toast.success('Progress digest sent to parent on WhatsApp')
        : toast.error('Could not deliver the digest'),
    onError: () => toast.error('Could not send digest'),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/students"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to students
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
            <TrackBadge track={data.track} />
            <StudentStatusBadge status={data.status} />
          </div>
          <p className="text-muted-foreground">
            Age {data.age} · Class {data.class} · {data.school}
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" /> {data.parent.name} — {data.parent.phone}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={data.status}
            onValueChange={(v) => statusMutation.mutate(v as StudentStatus)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => digestMutation.mutate()}
            disabled={digestMutation.isPending}
          >
            <MessageCircle className="h-4 w-4" /> Send progress to parent
          </Button>
          <Button onClick={() => assignMutation.mutate()} disabled={assignMutation.isPending}>
            <Send className="h-4 w-4" /> Send next quest
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatBox label="XP" value={data.xp} />
        <StatBox label="Level" value={data.level} />
        <StatBox label="Streak" value={`🔥 ${data.streak}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quest history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.assignments.length === 0 && (
              <p className="text-sm text-muted-foreground">No quests assigned yet.</p>
            )}
            {data.assignments.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0">
                <div>
                  <div className="text-sm font-medium">{a.quest.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDateTime(a.assignedAt)} · +{a.quest.xpReward} XP
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">XP ledger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.xpHistory.length === 0 && (
              <p className="text-sm text-muted-foreground">No XP earned yet.</p>
            )}
            {data.xpHistory.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-muted-foreground">{tx.reason}</span>
                <span className="shrink-0 font-semibold text-green-600">+{tx.points}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-5 text-center">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
