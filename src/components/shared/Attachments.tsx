import { FileText, ShieldCheck } from 'lucide-react';

import type { SubmissionAttachment } from '@/types/api';

/** Renders real-world proof attached to a submission. */
export function Attachments({ items }: { items: SubmissionAttachment[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((a, i) => {
        // Verify-then-forget: the file was discarded after AI verification.
        if (!a.url) {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed px-2.5 py-1.5 text-xs text-muted-foreground"
              title={a.hash ? `sha256 ${a.hash.slice(0, 12)}…` : undefined}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {a.type} proof — verified, not stored
            </span>
          );
        }
        if (a.type === 'image') {
          return (
            <a key={i} href={a.url} target="_blank" rel="noreferrer" title={a.caption}>
              <img
                src={a.url}
                alt={a.caption ?? 'proof'}
                className="h-24 w-24 rounded-md border object-cover transition-opacity hover:opacity-90"
              />
            </a>
          );
        }
        if (a.type === 'audio') {
          return <audio key={i} controls src={a.url} className="h-9" />;
        }
        if (a.type === 'video') {
          return (
            <video key={i} controls src={a.url} className="h-24 rounded-md border" />
          );
        }
        return (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent"
          >
            <FileText className="h-4 w-4" />
            {a.caption ?? 'Document'}
          </a>
        );
      })}
    </div>
  );
}
