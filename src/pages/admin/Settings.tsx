import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, CheckCircle2, Plug, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { api } from '@/lib/api';
import type { AiTestResult, AiVerificationMode, AppSettings } from '@/types/api';

export function Settings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<AppSettings>('/api/admin/settings'),
  });

  // Local form state, hydrated from the server.
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<Exclude<AiVerificationMode, 'off'>>('gemini');
  const [confidence, setConfidence] = useState(80);

  useEffect(() => {
    if (!data) return;
    setEnabled(data.aiVerificationMode !== 'off');
    setProvider(data.aiVerificationMode === 'mock' ? 'mock' : 'gemini');
    setConfidence(data.aiAutoApproveConfidence);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body: { aiVerificationMode: AiVerificationMode; aiAutoApproveConfidence: number }) =>
      api.patch<AppSettings>('/api/admin/settings', body),
    onSuccess: (updated) => {
      qc.setQueryData(['settings'], updated);
      toast.success('Settings saved');
    },
    onError: () => toast.error('Could not save settings'),
  });

  function save() {
    mutation.mutate({
      aiVerificationMode: enabled ? provider : 'off',
      aiAutoApproveConfidence: confidence,
    });
  }

  // Test the currently-selected provider without needing to save first.
  const testMutation = useMutation({
    mutationFn: () =>
      api.post<AiTestResult>('/api/admin/settings/ai/test', {
        mode: enabled ? provider : 'off',
      }),
  });

  const geminiUnavailable = provider === 'gemini' && data && !data.geminiAvailable;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Control how student answers are verified.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-primary" /> AI answer verification
          </CardTitle>
          <CardDescription>
            When on, each reply (and any proof) is checked by AI. Confident passes are
            auto-approved; everything else still goes to the human review queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading || !data ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-sm font-medium">Enable AI verification</Label>
                  <p className="text-xs text-muted-foreground">
                    Off = every reply is reviewed by a human (default).
                  </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>

              {enabled && (
                <div className="space-y-5 rounded-lg border p-4">
                  <div className="space-y-1.5">
                    <Label>Provider</Label>
                    <Select
                      value={provider}
                      onValueChange={(v) => setProvider(v as Exclude<AiVerificationMode, 'off'>)}
                    >
                      <SelectTrigger className="sm:w-72">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Gemini (real AI — needs API key)</SelectItem>
                        <SelectItem value="mock">Mock (deterministic test — no key)</SelectItem>
                      </SelectContent>
                    </Select>
                    {geminiUnavailable && (
                      <p className="text-xs text-destructive">
                        No <code>GEMINI_API_KEY</code> is configured on the server — Gemini will
                        behave as “off” until a key is set. Use Mock to test the flow.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Auto-approve confidence (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="sm:w-40"
                      value={confidence}
                      onChange={(e) => setConfidence(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      A reply auto-approves only when the AI says “approve” with at least this
                      confidence. Higher = stricter (more replies go to a human).
                    </p>
                  </div>

                  <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Privacy: proof files are verified in memory and never stored —
                      only the AI verdict, a reason, and a hash are kept.
                    </span>
                  </div>

                  {/* Connectivity check */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Label className="text-sm font-medium">Is the AI responding?</Label>
                        <p className="text-xs text-muted-foreground">
                          Pings {provider === 'gemini' ? 'Gemini' : 'the mock provider'} with a tiny
                          sample to confirm it’s reachable.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => testMutation.mutate()}
                        disabled={testMutation.isPending}
                      >
                        <Plug className="h-4 w-4" />
                        {testMutation.isPending ? 'Testing…' : 'Test connection'}
                      </Button>
                    </div>

                    {testMutation.data && <TestResultBanner result={testMutation.data} />}
                    {testMutation.isError && (
                      <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                        <XCircle className="h-4 w-4 shrink-0" /> Could not run the test.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Current: <span className="font-medium">{data.aiVerificationMode}</span>
                </span>
                <Button onClick={save} disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TestResultBanner({ result }: { result: AiTestResult }) {
  if (result.ok) {
    return (
      <div className="flex items-start gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <span className="font-medium">{result.model ?? result.mode}</span> responded
          {result.ms !== undefined ? ` in ${result.ms}ms` : ''} — sample verdict:{' '}
          <span className="font-medium">{result.verdict}</span>
          {result.confidence !== undefined ? ` (${result.confidence}%)` : ''}.
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{result.error ? `Error: ${result.error}` : (result.reason ?? 'Not responding.')}</span>
    </div>
  );
}
