import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { TONE_CHIP, type Tone } from "../../lib/status";

interface BadgeProps {
  tone: Tone;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone, icon: Icon, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "border border-border",
        TONE_CHIP[tone],
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}
