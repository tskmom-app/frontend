import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Target } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, api } from '@/lib/api';
import type { Track } from '@/types/api';

const signupSchema = z.object({
  parentName: z.string().min(2, 'Please enter your name'),
  phone: z
    .string()
    .min(7, 'Enter a valid WhatsApp number')
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid WhatsApp number'),
  studentName: z.string().min(2, "Enter your child's name"),
  age: z.coerce.number().int().min(13, 'Ages 13–22 supported').max(22, 'Ages 13–22 supported'),
  class: z.string().min(1, 'Required'),
  school: z.string().min(1, 'Required'),
});

type SignupForm = z.input<typeof signupSchema>;

interface SignupResult {
  studentId: string;
  name: string;
  track: Track;
  message: string;
}

export function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { parentName: '', phone: '', studentName: '', class: '', school: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: SignupForm) =>
      api.post<SignupResult>('/api/signup', signupSchema.parse(values), { anonymous: true }),
  });

  if (mutation.isSuccess) {
    return (
      <Shell>
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
            <h2 className="text-2xl font-bold">You’re in, {mutation.data.name}! 🎉</h2>
            <p className="text-muted-foreground">{mutation.data.message}</p>
            <div className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              Track assigned: <span className="font-bold">{mutation.data.track}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Watch WhatsApp tomorrow at 9 AM for the first real-world quest. No screens. No
              quizzes. Just go do something real. 💪
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-8 max-w-md text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <Target className="h-4 w-4" /> TskMom
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Daily quests. Real problems.
          <br />
          Entrepreneurial habit.
        </h1>
        <p className="mt-3 text-muted-foreground">
          One real-world challenge a day, delivered on WhatsApp. Your child learns to spot
          problems, talk to people, and ship ideas — off the screen, in real life.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            noValidate
          >
            <Field label="Parent name" error={errors.parentName?.message}>
              <Input placeholder="e.g. Asha Verma" {...register('parentName')} />
            </Field>
            <Field label="WhatsApp number" error={errors.phone?.message}>
              <Input placeholder="+91 98765 43210" inputMode="tel" {...register('phone')} />
            </Field>

            <div className="h-px bg-border" />

            <Field label="Student name" error={errors.studentName?.message}>
              <Input placeholder="e.g. Riya" {...register('studentName')} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age" error={errors.age?.message}>
                <Input type="number" min={13} max={22} placeholder="14" {...register('age')} />
              </Field>
              <Field label="Class" error={errors.class?.message}>
                <Input placeholder="9" {...register('class')} />
              </Field>
            </div>
            <Field label="School" error={errors.school?.message}>
              <Input placeholder="e.g. Delhi Public School" {...register('school')} />
            </Field>

            {mutation.isError && (
              <p className="text-sm text-destructive">
                {mutation.error instanceof ApiError
                  ? mutation.error.message
                  : 'Something went wrong. Please try again.'}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? 'Starting…' : 'Start the adventure 🚀'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        Are you an admin?{' '}
        <Link to="/admin/login" className="font-medium text-primary hover:underline">
          Sign in here
        </Link>
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-12">
      {children}
    </div>
  );
}

function Field({
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
