import { Badge } from '@/components/ui/badge';
import { QUALITY_FLAG_LABELS, STAGE_META, STATUS_META, qualityLevel } from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
  AiVerdict,
  AssignmentStatus,
  GrowthAreaProgress,
  Stage,
  StudentStatus,
} from '@/types/api';

export function StageBadge({ stage }: { stage: Stage }) {
  const meta = STAGE_META[stage];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        meta.className,
      )}
    >
      {meta.label}
      <span className="opacity-60">{meta.ageRange}</span>
    </span>
  );
}

/** Per-growth-area progress bars (the development % from the PDF). */
export function GrowthBars({ growth }: { growth: GrowthAreaProgress[] }) {
  if (!growth?.length) return null;
  return (
    <div className="space-y-2.5">
      {growth.map((g) => (
        <div key={g.growthAreaId}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium">{g.name}</span>
            <span className="text-muted-foreground">{g.percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${g.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', meta.className)}>
      {meta.label}
    </span>
  );
}

const STUDENT_STATUS_STYLE: Record<StudentStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-slate-100 text-slate-600',
  paused: 'bg-amber-100 text-amber-800',
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        STUDENT_STATUS_STYLE[status],
      )}
    >
      {status}
    </span>
  );
}

export function DifficultyDots({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" title={`Difficulty ${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn('h-1.5 w-1.5 rounded-full', i < value ? 'bg-primary' : 'bg-muted')}
        />
      ))}
    </span>
  );
}

export function SkillBadge({ name }: { name: string }) {
  return <Badge variant="secondary">{name}</Badge>;
}

const AI_VERDICT_STYLE: Record<AiVerdict, { label: string; className: string }> = {
  approve: { label: 'AI: pass', className: 'bg-green-100 text-green-800' },
  reject: { label: 'AI: fail', className: 'bg-red-100 text-red-800' },
  unsure: { label: 'AI: unsure', className: 'bg-amber-100 text-amber-800' },
};

/** Gemini verification verdict + confidence (shown in the review queue). */
export function AiVerdictBadge({
  verdict,
  confidence,
}: {
  verdict: AiVerdict | null;
  confidence: number | null;
}) {
  if (!verdict) return null;
  const meta = AI_VERDICT_STYLE[verdict];
  return (
    <span
      className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', meta.className)}
      title="Automated AI verification (Gemini)"
    >
      🤖 {meta.label}
      {confidence !== null ? ` ${confidence}%` : ''}
    </span>
  );
}

const QUALITY_STYLE: Record<'low' | 'medium' | 'high' | 'none', string> = {
  low: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-green-100 text-green-800',
  none: 'bg-slate-100 text-slate-600',
};

/** Heuristic pre-filter signal: a score chip + human-readable flag pills. */
export function QualityBadge({
  score,
  flags,
}: {
  score: number | null;
  flags: string[];
}) {
  const level = qualityLevel(score);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', QUALITY_STYLE[level])}
        title="Heuristic quality score (not AI) — aids triage"
      >
        {score === null ? 'unscored' : `Quality ${score}`}
      </span>
      {flags.map((f) => {
        const meta = QUALITY_FLAG_LABELS[f] ?? { label: f, good: false };
        return (
          <span
            key={f}
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-medium',
              meta.good ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
            )}
          >
            {meta.good ? '✓' : '⚠'} {meta.label}
          </span>
        );
      })}
    </div>
  );
}
