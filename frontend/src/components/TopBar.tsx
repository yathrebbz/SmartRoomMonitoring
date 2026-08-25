import { clsx } from "clsx";
import {
  ExternalLink,
  House,
  LoaderCircle,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
  TriangleAlert,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

import type { ConnectionState } from "../hooks/useSmartRoom";
import type { ThemePreference } from "../hooks/useTheme";
import { TONE_CHIP, type Tone } from "../lib/status";

interface TopBarProps {
  connection: ConnectionState;
  onRetry: () => void;
  themePreference: ThemePreference;
  onCycleTheme: () => void;
}

const CONNECTION: Record<ConnectionState, { tone: Tone; label: string; short: string; icon: LucideIcon }> = {
  checking: { tone: "neutral", label: "Connexion à l'API…", short: "Connexion…", icon: LoaderCircle },
  online: { tone: "good", label: "API en ligne · modèle chargé", short: "En ligne", icon: Wifi },
  degraded: { tone: "warn", label: "API en ligne · modèle non chargé", short: "Modèle absent", icon: TriangleAlert },
  offline: { tone: "bad", label: "API injoignable", short: "Hors ligne", icon: WifiOff },
};

const THEME: Record<ThemePreference, { icon: LucideIcon; label: string }> = {
  system: { icon: Monitor, label: "Thème : système" },
  light: { icon: Sun, label: "Thème : clair" },
  dark: { icon: Moon, label: "Thème : sombre" },
};

export function TopBar({ connection, onRetry, themePreference, onCycleTheme }: TopBarProps) {
  const state = CONNECTION[connection];
  const StateIcon = state.icon;
  const theme = THEME[themePreference];
  const ThemeIcon = theme.icon;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-fg shadow-[0_8px_20px_-8px_var(--brand)]">
            <House className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold leading-tight tracking-tight text-fg">Smart Room AI</p>
            <p className="truncate text-xs text-fg-muted">Supervision énergétique intelligente</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            role="status"
            aria-live="polite"
            className={clsx(
              "flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-semibold whitespace-nowrap",
              state.tone === "neutral" && "border border-border",
              TONE_CHIP[state.tone],
            )}
          >
            <StateIcon className={clsx("size-3.5", connection === "checking" && "animate-spin")} aria-hidden />
            <span className="hidden sm:inline">{state.label}</span>
            <span className="sm:hidden">{state.short}</span>
            {connection === "offline" && (
              <button
                type="button"
                onClick={onRetry}
                className="-mr-1 ml-1 grid size-7 cursor-pointer place-items-center rounded-full hover:bg-bad/15"
                aria-label="Réessayer la connexion"
              >
                <RotateCcw className="size-3.5" aria-hidden />
              </button>
            )}
          </div>

          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="hidden h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg md:inline-flex"
          >
            API
            <ExternalLink className="size-3.5" aria-hidden />
          </a>

          <button
            type="button"
            onClick={onCycleTheme}
            aria-label={`${theme.label} — cliquer pour changer`}
            title={theme.label}
            className="grid size-11 cursor-pointer place-items-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <ThemeIcon className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}
