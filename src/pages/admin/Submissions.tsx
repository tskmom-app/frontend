import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Attachments } from '@/components/shared/Attachments';
import { AiVerdictBadge, QualityBadge, StatusBadge, TrackBadge } from '@/components/shared/Badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import type { Paginated, SubmissionListItem } from '@/types/api';

type Filter = 'submitted' | 'approved' | 'rejected' | 'all';

export function Submissions() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>('submitted');
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', filter],
    queryFn: () =>
      api.get<Paginated<SubmissionListItem>>('/api/admin/submissions', {
        status: filter,
        pageSize: 50,
      }),
    refetchInterval: 30_000,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      api.post(`/api/admin/submissions/${id}/${action}`, {
        feedback: feedback[id]?.trim() || undefined,
      }),
    onSuccess: (_res, { action }) => {
      toast.success(action === 'approve' ? 'Approved & XP awarded 🎉' : 'Sent back for another go');
      qc.invalidateQueries({ queryKey: ['submissions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => toast.error('Could not record your review'),
  });

  const isReviewable = filter === 'submitted';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">Review what students did in the real world.</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="submitted">Review queue</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {!isLoading && data?.items.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            {filter === 'submitted'
              ? '🎉 Review queue is empty — all caught up!'
              : 'Nothing here yet.'}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {data?.items.map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/students/${s.student.id}`}
                    className="font-semibold hover:underline"
                  >
                    {s.student.name}
                  </Link>
                  <TrackBadge track={s.student.track} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {s.assignmentStatus && <StatusBadge status={s.assignmentStatus} />}
                  <span>{timeAgo(s.submittedAt)}</span>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Quest: </span>
                <span className="font-medium">{s.quest.title}</span>
                <span className="text-muted-foreground"> · +{s.quest.xpReward} XP</span>
              </div>

              {s.answer && (
                <blockquote className="whitespace-pre-wrap rounded-md border-l-2 border-primary bg-muted/50 p-3 text-sm">
                  {s.answer}
                </blockquote>
              )}

              {s.attachments.length > 0 && <Attachments items={s.attachments} />}

              {/* AI verdict (Gemini) + heuristic pre-filter signal */}
              <div className="flex flex-wrap items-center gap-2">
                <AiVerdictBadge verdict={s.aiVerdict} confidence={s.aiConfidence} />
                <QualityBadge score={s.qualityScore} flags={s.qualityFlags} />
              </div>
              {s.aiReason && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">🤖 AI:</span> {s.aiReason}
                </p>
              )}

              {s.feedback && !isReviewable && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Feedback:</span> {s.feedback}
                </p>
              )}

              {isReviewable && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Optional feedback for the student…"
                    value={feedback[s.id] ?? ''}
                    onChange={(e) => setFeedback((f) => ({ ...f, [s.id]: e.target.value }))}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewMutation.isPending}
                      onClick={() => reviewMutation.mutate({ id: s.id, action: 'reject' })}
                    >
                      <X className="h-4 w-4" /> Send back
                    </Button>
                    <Button
                      size="sm"
                      disabled={reviewMutation.isPending}
                      onClick={() => reviewMutation.mutate({ id: s.id, action: 'approve' })}
                    >
                      <Check className="h-4 w-4" /> Approve &amp; award XP
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
