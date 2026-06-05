import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  Phone,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  User,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, api } from '@/lib/api';
import { STAGE_META, STAGE_ORDER } from '@/lib/format';
import type { Stage } from '@/types/api';

const signupSchema = z.object({
  parentName: z.string().min(2, 'Please enter your name'),
  phone: z
    .string()
    .min(7, 'Enter a valid phone number')
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number'),
  studentName: z.string().min(2, "Enter your child's name"),
  age: z.coerce.number().int().min(5, 'Ages 5–25 supported').max(25, 'Ages 5–25 supported'),
  class: z.string().min(1, 'Required'),
  school: z.string().min(1, 'Required'),
});

type SignupForm = z.input<typeof signupSchema>;

interface SignupResult {
  studentId: string;
  name: string;
  stage: Stage;
  loginCode: string;
  message: string;
}

const STEPS = [
  {
    icon: Smartphone,
    title: 'Get a simple mission',
    body: 'Every day, one small real-world mission appears in the TskMom app — tuned to your child’s stage.',
  },
  {
    icon: Rocket,
    title: 'They do it in real life',
    body: 'Observe, talk to people, solve a small problem, take a responsibility — off the screen, today.',
  },
  {
    icon: Sparkles,
    title: 'Reflect, and grow',
    body: 'They log a reflection. It’s mentor-reviewed, and each growth area inches up — building a childhood story over time.',
  },
];

const STAGE_RINGS: Record<Stage, string> = {
  foundation: 'ring-rose-200 bg-rose-50',
  responsibility: 'ring-amber-200 bg-amber-50',
  ownership: 'ring-sky-200 bg-sky-50',
  judgment: 'ring-emerald-200 bg-emerald-50',
  leadership: 'ring-violet-200 bg-violet-50',
  independence: 'ring-fuchsia-200 bg-fuchsia-50',
};

const STAGE_BLURBS: Record<Stage, string> = {
  foundation: 'First small responsibilities and noticing the world around them.',
  responsibility: 'Owning daily routines and following through without reminders.',
  ownership: 'Taking initiative, solving real problems, and acting independently.',
  judgment: 'Making decisions, weighing trade-offs, and handling money and people.',
  leadership: 'Leading others, running real projects, and seeing them through.',
  independence: 'True self-direction — building things that matter in the real world.',
};

const GROWTH_AREAS = [
  'Responsibility',
  'Confidence',
  'Communication',
  'Initiative',
  'Leadership',
  'Problem Solving',
  'Character',
  'Independence',
];

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

  if (mutation.isSuccess) return <SuccessScreen result={mutation.data} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* ---------------- Hero + form ---------------- */}
      <section className="relative overflow-hidden">
        {/* decorative glows */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          {/* Left — pitch */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> One simple challenge a day
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Build childhood,
              <br />
              <span className="text-primary">intelligently.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              One simple challenge a day to help children become more{' '}
              <span className="font-medium text-foreground">capable, responsible, and independent</span>.
              TskMom helps parents shape how their children think and act through small, real-world
              challenges — by doing things in real life, not on a screen.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {['In the app', 'One mission a day', '5 min a day', 'Ages 5–25'].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
                </span>
              ))}
            </div>

            <div className="mt-8 hidden flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:flex">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Mentor-reviewed
              </span>
              <span className="inline-flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Builds a 30-day habit
              </span>
            </div>
          </div>

          {/* Right — signup card */}
          <div id="signup" className="lg:justify-self-end">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-card shadow-xl">
              <div className="border-b bg-gradient-to-br from-primary/10 to-transparent px-5 py-3.5">
                <h2 className="text-base font-bold">Start free in 30 seconds</h2>
                <p className="text-xs text-muted-foreground">
                  Your child’s first mission is ready in the app.
                </p>
              </div>

              <form
                className="space-y-3.5 p-5"
                onSubmit={handleSubmit((values) => mutation.mutate(values))}
                noValidate
              >
                <GroupLabel>Your details</GroupLabel>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Your name" icon={User} error={errors.parentName?.message}>
                    <Input className="pl-9" placeholder="Asha Verma" {...register('parentName')} />
                  </Field>
                  <Field label="Phone number" icon={Phone} error={errors.phone?.message}>
                    <Input
                      className="pl-9"
                      placeholder="+91 98765 43210"
                      inputMode="tel"
                      {...register('phone')}
                    />
                  </Field>
                </div>

                <div className="border-t pt-3.5">
                  <GroupLabel>Your child</GroupLabel>
                </div>
                <Field label="Child's name" icon={GraduationCap} error={errors.studentName?.message}>
                  <Input className="pl-9" placeholder="Riya" {...register('studentName')} />
                </Field>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Age" error={errors.age?.message}>
                    <Input type="number" min={5} max={25} placeholder="11" {...register('age')} />
                  </Field>
                  <Field label="Class" error={errors.class?.message}>
                    <Input placeholder="9" {...register('class')} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="School" error={errors.school?.message}>
                      <Input placeholder="DPS" {...register('school')} />
                    </Field>
                  </div>
                </div>

                {mutation.isError && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {mutation.error instanceof ApiError
                      ? mutation.error.message
                      : 'Something went wrong. Please try again.'}
                  </p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Starting…' : 'Start free'}
                  {!mutation.isPending && <ArrowRight className="h-4 w-4" />}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  We only contact you about your child's progress.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            No quizzes. No videos. Just one small real-world action a day that compounds into who
            they become.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xs font-bold text-primary">STEP {i + 1}</div>
                <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Stages ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          A journey that grows with them
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
          Missions are matched to a developmental stage — from first small responsibilities to real
          independence.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STAGE_ORDER.map((stage) => (
            <div key={stage} className={`rounded-2xl p-6 ring-1 ${STAGE_RINGS[stage]}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-bold text-slate-900">{STAGE_META[stage].label}</h3>
                <span className="text-sm font-semibold text-slate-500">
                  Ages {STAGE_META[stage].ageRange}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{STAGE_BLURBS[stage]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Growth areas ---------------- */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            The 8 growth areas we develop
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Every mission strengthens one real-life growth area — and you watch each one rise.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {GROWTH_AREAS.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm"
              >
                <Compass className="h-4 w-4 text-primary" /> {name}
              </span>
            ))}
          </div>

          <div className="mt-12">
            <Button asChild size="lg">
              <a href="#signup">
                Start your child today <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Target className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">TskMom</span>
        </div>
        <Link
          to="/admin/login"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Admin sign in
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">TskMom</span>
          <span>· One simple challenge a day. Capable. Responsible. Independent.</span>
        </div>
        <Link to="/admin/login" className="hover:text-foreground">
          Admin
        </Link>
      </div>
    </footer>
  );
}

function SuccessScreen({ result }: { result: SignupResult }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 to-background">
      <Nav />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
          <h2 className="mt-5 text-2xl font-bold">You’re in, {result.name}! 🎉</h2>
          <p className="mt-2 text-muted-foreground">{result.message}</p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            <Sparkles className="h-4 w-4" /> Stage assigned: {STAGE_META[result.stage].label}
          </div>

          <div className="mt-6 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {result.name}’s app login code
            </p>
            <p className="mt-1 font-mono text-3xl font-extrabold tracking-[0.3em] text-primary">
              {result.loginCode}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open the TskMom app and sign in with this code. Keep it safe.
            </p>
          </div>

          <div className="mt-6 space-y-2 rounded-xl border bg-muted/40 p-4 text-left text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Open the <strong className="text-foreground">TskMom app</strong> to see the first
              mission, tuned to your child’s stage.
            </p>
            <p className="flex items-start gap-2">
              <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              No screens, no quizzes — just go do something real, then log a reflection.
            </p>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            One simple mission a day. Capable. Responsible. Independent. 💪
          </p>
        </div>
      </div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
  );
}

function Field({
  label,
  error,
  icon: Icon,
  children,
}: {
  label: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        {children}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
