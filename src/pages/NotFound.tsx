import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 text-center">
      <div className="text-6xl">🤔</div>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">This quest doesn’t exist… yet.</p>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
