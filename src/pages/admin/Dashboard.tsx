import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CheckCircle2,
  Flame,
  Inbox,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StageBadge } from '@/components/shared/Badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { STAGE_ORDER } from '@/lib/format';
import type { DashboardData } from '@/types/api';

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/api/admin/analytics/dashboard'),
    refetchInterval: 60_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          The MVP question: can students complete one real-world quest a day for 30 days?
        </p>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat
              icon={Users}
              label="Total Students"
              value={data.totals.totalStudents}
              tint="text-violet-500"
            />
            <Stat
              icon={UserCheck}
              label="Active Students"
              value={data.totals.activeStudents}
              tint="text-green-500"
            />
            <Stat
              icon={Activity}
              label="Submissions Today"
              value={data.totals.submissionsToday}
              tint="text-blue-500"
            />
            <Stat
              icon={CheckCircle2}
              label="Quest Completion"
              value={`${data.totals.questCompletionRate}%`}
              tint="text-emerald-500"
            />
            <Stat
              icon={Inbox}
              label="Pending Review"
              value={data.totals.pendingReview}
              tint="text-amber-500"
            />
            <Stat
              icon={Flame}
              label="Avg / Max Streak"
              value={`${data.totals.avgStreak} / ${data.totals.maxStreak}`}
              tint="text-orange-500"
            />
            <Stat
              icon={Sparkles}
              label="Total XP Earned"
              value={data.totals.totalXp.toLocaleString()}
              tint="text-fuchsia-500"
            />
            <Stat
              icon={TrendingUp}
              label="30-day Retention"
              value={data.totals.retention30d === null ? '—' : `${data.totals.retention30d}%`}
              tint="text-cyan-500"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Activity — last 7 days</CardTitle>
              </CardHeader>
              <CardContent>
                {data.activity.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No submissions yet. Once students start replying, you’ll see daily activity
                    here.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.activity}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                      <XAxis
                        dataKey="day"
                        tickFormatter={(d: string) => d.slice(5)}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="submissions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="approvals" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top students</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.leaderboard.length === 0 && (
                  <p className="text-sm text-muted-foreground">No students yet.</p>
                )}
                {data.leaderboard.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="w-5 text-sm font-bold text-muted-foreground">{i + 1}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{s.name}</div>
                      <StageBadge stage={s.stage} />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{s.xp} XP</div>
                      <div className="text-xs text-muted-foreground">🔥 {s.streak}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Students by stage</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-6">
              {STAGE_ORDER.map((stage) => {
                const found = data.stageDistribution.find((t) => t.stage === stage);
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <StageBadge stage={stage} />
                    <span className="text-2xl font-bold">{found?.count ?? 0}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <Icon className={`h-5 w-5 ${tint}`} />
        <div className="mt-3 text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
