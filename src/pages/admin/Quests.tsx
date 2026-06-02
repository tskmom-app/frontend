import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { DifficultyDots, SkillBadge } from '@/components/shared/Badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, api } from '@/lib/api';
import type { Paginated, QuestWithSkill, Skill } from '@/types/api';

const ALL = '__all__';

const questFormSchema = z
  .object({
    title: z.string().min(3, 'Title is too short'),
    skillId: z.string().uuid('Pick a skill'),
    mission: z.string().min(3, 'Required'),
    action: z.string().min(3, 'Required'),
    reflection: z.string().min(3, 'Required'),
    ageMin: z.coerce.number().int().min(5).max(99),
    ageMax: z.coerce.number().int().min(5).max(99),
    difficulty: z.coerce.number().int().min(1).max(5),
    xpReward: z.coerce.number().int().min(0).max(1000),
    isActive: z.boolean(),
    requiresProof: z.boolean(),
    proofHint: z.string().trim().max(280).optional(),
  })
  .refine((d) => d.ageMin <= d.ageMax, { message: 'ageMin must be ≤ ageMax', path: ['ageMin'] });

type QuestForm = z.input<typeof questFormSchema>;

export function QuestsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [skillId, setSkillId] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<QuestWithSkill | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: skills } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.get<Skill[]>('/api/admin/skills'),
    staleTime: Infinity,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['quests', { search, skillId, page }],
    queryFn: () =>
      api.get<Paginated<QuestWithSkill>>('/api/admin/quests', {
        search: search || undefined,
        skillId: skillId === ALL ? undefined : skillId,
        page,
        pageSize: 20,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/quests/${id}`),
    onSuccess: () => {
      toast.success('Quest deleted');
      qc.invalidateQueries({ queryKey: ['quests'] });
    },
    onError: () => toast.error('Could not delete quest'),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(quest: QuestWithSkill) {
    setEditing(quest);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quests</h1>
          <p className="text-muted-foreground">{data?.total ?? 0} quests in the bank</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New quest
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={skillId}
            onValueChange={(v) => {
              setSkillId(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-52">
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All skills</SelectItem>
              {skills?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Ages</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No quests match these filters.
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      {q.title}
                      {q.requiresProof && (
                        <span title="Requires proof" className="text-xs">
                          📸
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{q.mission}</div>
                  </TableCell>
                  <TableCell>
                    <SkillBadge name={q.skillName} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {q.ageMin}–{q.ageMax}
                  </TableCell>
                  <TableCell>
                    <DifficultyDots value={q.difficulty} />
                  </TableCell>
                  <TableCell className="font-semibold">{q.xpReward}</TableCell>
                  <TableCell>
                    {q.isActive ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Delete “${q.title}”? This cannot be undone.`)) {
                            deleteMutation.mutate(q.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {data.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <QuestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        skills={skills ?? []}
      />
    </div>
  );
}

function QuestDialog({
  open,
  onOpenChange,
  editing,
  skills,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: QuestWithSkill | null;
  skills: Skill[];
}) {
  const qc = useQueryClient();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit quest' : 'New quest'}</DialogTitle>
          <DialogDescription>
            Every action must push the student into the real world — no quizzes, no videos.
          </DialogDescription>
        </DialogHeader>
        {/* Remount the form when switching target so defaults reset cleanly. */}
        <QuestForm
          key={editing?.id ?? 'new'}
          editing={editing}
          skills={skills}
          onDone={() => {
            onOpenChange(false);
            qc.invalidateQueries({ queryKey: ['quests'] });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function QuestFormFields({
  editing,
  skills,
  onDone,
}: {
  editing: QuestWithSkill | null;
  skills: Skill[];
  onDone: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuestForm>({
    resolver: zodResolver(questFormSchema),
    defaultValues: editing
      ? {
          title: editing.title,
          skillId: editing.skillId,
          mission: editing.mission,
          action: editing.action,
          reflection: editing.reflection,
          ageMin: editing.ageMin,
          ageMax: editing.ageMax,
          difficulty: editing.difficulty,
          xpReward: editing.xpReward,
          isActive: editing.isActive,
          requiresProof: editing.requiresProof,
          proofHint: editing.proofHint ?? '',
        }
      : {
          title: '',
          skillId: '',
          mission: '',
          action: '',
          reflection: '',
          ageMin: 13,
          ageMax: 15,
          difficulty: 1,
          xpReward: 15,
          isActive: true,
          requiresProof: false,
          proofHint: '',
        },
  });

  const mutation = useMutation({
    mutationFn: (values: QuestForm) => {
      const body = questFormSchema.parse(values);
      return editing
        ? api.put(`/api/admin/quests/${editing.id}`, body)
        : api.post('/api/admin/quests', body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Quest updated' : 'Quest created');
      onDone();
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Could not save quest'),
  });

  const skillId = watch('skillId');
  const isActive = watch('isActive');
  const requiresProof = watch('requiresProof');

  return (
    <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
      <FormField label="Title" error={errors.title?.message}>
        <Input placeholder="The Stranger Test" {...register('title')} />
      </FormField>

      <FormField label="Skill" error={errors.skillId?.message}>
        <Select value={skillId} onValueChange={(v) => setValue('skillId', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Pick a skill" />
          </SelectTrigger>
          <SelectContent>
            {skills.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Mission (the goal)" error={errors.mission?.message}>
        <Textarea rows={2} {...register('mission')} />
      </FormField>
      <FormField label="Action (the real-world task)" error={errors.action?.message}>
        <Textarea rows={3} {...register('action')} />
      </FormField>
      <FormField label="Reflection (a question)" error={errors.reflection?.message}>
        <Textarea rows={2} {...register('reflection')} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Age min" error={errors.ageMin?.message}>
          <Input type="number" {...register('ageMin')} />
        </FormField>
        <FormField label="Age max" error={errors.ageMax?.message}>
          <Input type="number" {...register('ageMax')} />
        </FormField>
        <FormField label="Difficulty (1–5)" error={errors.difficulty?.message}>
          <Input type="number" min={1} max={5} {...register('difficulty')} />
        </FormField>
        <FormField label="XP reward" error={errors.xpReward?.message}>
          <Input type="number" {...register('xpReward')} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-input"
          checked={isActive}
          onChange={(e) => setValue('isActive', e.target.checked)}
        />
        Active (eligible for daily assignment)
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-input"
          checked={requiresProof}
          onChange={(e) => setValue('requiresProof', e.target.checked)}
        />
        Require proof (ask the student for a photo / voice note)
      </label>

      {requiresProof && (
        <FormField label="Proof hint (what should they send?)" error={errors.proofHint?.message}>
          <Input placeholder="Send a photo of what you sold" {...register('proofHint')} />
        </FormField>
      )}

      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create quest'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Alias kept stable for the remount key usage above.
const QuestForm = QuestFormFields;

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
