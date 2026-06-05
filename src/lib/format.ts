import type { AssignmentStatus, MissionCategory, Stage } from '@/types/api';

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const STAGE_ORDER: Stage[] = [
  'foundation',
  'responsibility',
  'ownership',
  'judgment',
  'leadership',
  'independence',
];

export const STAGE_META: Record<Stage, { label: string; ageRange: string; className: string }> = {
  foundation: { label: 'Foundation', ageRange: '5–8', className: 'bg-rose-100 text-rose-800' },
  responsibility: {
    label: 'Responsibility',
    ageRange: '9–11',
    className: 'bg-amber-100 text-amber-800',
  },
  ownership: { label: 'Ownership', ageRange: '12–14', className: 'bg-sky-100 text-sky-800' },
  judgment: { label: 'Judgment', ageRange: '15–17', className: 'bg-emerald-100 text-emerald-800' },
  leadership: { label: 'Leadership', ageRange: '18–20', className: 'bg-violet-100 text-violet-800' },
  independence: {
    label: 'Independence',
    ageRange: '21–25',
    className: 'bg-fuchsia-100 text-fuchsia-800',
  },
};

export const CATEGORY_LABELS: Record<MissionCategory, string> = {
  home: 'Home',
  family: 'Family',
  community: 'Community',
  money: 'Money',
  thinking: 'Thinking',
  character: 'Character',
  communication: 'Communication',
  leadership: 'Leadership',
  problem_solving: 'Problem Solving',
};

export const STATUS_META: Record<AssignmentStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-slate-100 text-slate-700' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
};

/** Human-readable labels for the heuristic pre-filter flags. */
export const QUALITY_FLAG_LABELS: Record<string, { label: string; good: boolean }> = {
  too_short: { label: 'Very short', good: false },
  maybe_off_topic: { label: 'Maybe off-topic', good: false },
  gibberish: { label: 'Looks like gibberish', good: false },
  no_spaces: { label: 'No spaces', good: false },
  low_text_ratio: { label: 'Mostly non-text', good: false },
  duplicate: { label: 'Duplicate of an earlier reply', good: false },
  missing_proof: { label: 'Proof required but missing', good: false },
  has_specifics: { label: 'Has concrete details', good: true },
  has_proof: { label: 'Proof attached', good: true },
};

export function qualityLevel(score: number | null): 'low' | 'medium' | 'high' | 'none' {
  if (score === null || score === undefined) return 'none';
  return score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
}
