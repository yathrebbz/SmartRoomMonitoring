import { OctagonAlert, RotateCcw } from "lucide-react";

import { Button } from "./ui/Button";

interface ErrorBannerProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ title, message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-start gap-3 rounded-card border border-bad/40 bg-bad-soft p-4 text-sm"
    >
      <OctagonAlert className="mt-0.5 size-5 shrink-0 text-bad-fg" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-fg">{title}</p>
        <p className="mt-0.5 text-fg-muted">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" icon={RotateCcw} onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
