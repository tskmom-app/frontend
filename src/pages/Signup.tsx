import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  GraduationCap,
  Handshake,
  Lightbulb,
  MessageCircle,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
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

const STEPS = [
  {
    icon: MessageCircle,
    title: 'Get a simple challenge',
    body: 'Every morning at 9 AM, one small real-world challenge lands on WhatsApp. No app to install.',
  },
  {
    icon: Rocket,
    title: 'They do it in real life',
    body: 'Observe, talk to people, solve a small problem, take a responsibility — off the screen, today.',
  },
  {
    icon: Sparkles,
    title: 'Reflect, and grow',
    body: 'They reply with what happened. A mentor reviews it and keeps the daily habit alive.',
  },
];

const TRACKS: { name: Track; ages: string; blurb: string; ring: string }[] = [
  {
    name: 'Explorer',
    ages: '13–15',
    blurb: 'Safe, confidence-building challenges that get them noticing the world and taking small responsibilities.',
    ring: 'ring-sky-200 bg-sky-50',
  },
  {
    name: 'Builder',
    ages: '16–18',
    blurb: 'Bigger challenges — talking to people, solving real problems, and acting independently.',
    ring: 'ring-amber-200 bg-amber-50',
  },
  {
    name: 'Creator',
    ages: '19–22',
    blurb: 'Real-world projects that build initiative, follow-through, and true independence.',
    ring: 'ring-violet-200 bg-violet-50',
  },
];

const SKILLS = [
  { name: 'Observation', icon: Eye },
  { name: 'Communication', icon: MessageCircle },
  { name: 'Problem Discovery', icon: Search },
  { name: 'Problem Solving', icon: Lightbulb },
  { name: 'Validation', icon: CheckCircle2 },
  { name: 'Selling', icon: Handshake },
  { name: 'Execution', icon: Rocket },
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
              {['On WhatsApp', 'No app to install', '5 min a day', 'Ages 13–22'].map((t) => (
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
                  First challenge tomorrow at 9 AM on WhatsApp.
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
                  <Field label="WhatsApp number" icon={Phone} error={errors.phone?.message}>
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
                    <Input type="number" min={13} max={22} placeholder="14" {...register('age')} />
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
                  We only message you about your child's challenges.
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

      {/* ---------------- Tracks ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          A path that grows with them
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
          Challenges are matched to age — from first small responsibilities to real independence.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TRACKS.map((t) => (
            <div key={t.name} className={`rounded-2xl p-6 ring-1 ${t.ring}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-bold text-slate-900">{t.name}</h3>
                <span className="text-sm font-semibold text-slate-500">Ages {t.ages}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{t.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Skills ---------------- */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">The 7 capabilities they build</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Every challenge strengthens one real-life capability.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {SKILLS.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm"
              >
                <s.icon className="h-4 w-4 text-primary" /> {s.name}
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
            <Sparkles className="h-4 w-4" /> Track assigned: {result.track}
          </div>

          <div className="mt-6 space-y-2 rounded-xl border bg-muted/40 p-4 text-left text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Watch WhatsApp <strong className="text-foreground">tomorrow at 9 AM</strong> for the
              first challenge.
            </p>
            <p className="flex items-start gap-2">
              <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              No screens, no quizzes — just go do something real, then reply.
            </p>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            One simple challenge a day. Capable. Responsible. Independent. 💪
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
