import { clsx } from "clsx";
import { CalendarDays, Coins, PiggyBank, Zap, type LucideIcon } from "lucide-react";

import type { AppConfig, PredictResponse, ProfileResponse, Reading } from "../../api/types";
import { clamp, fmt, fmtKwh, fmtPercent, fmtTnd, fmtWh } from "../../lib/format";
import { FINANCIAL, TONE_BAR, TONE_CHIP, type Tone } from "../../lib/status";

interface KpiTileProps {
  icon: LucideIcon;
  label: string;
  value: string | null;
  detail?: string;
  tone?: Tone;
  progress?: number;
  loading?: boolean;
}

function KpiTile({ icon: Icon, label, value, detail, tone = "brand", progress, loading }: KpiTileProps) {
  return (
    <div
      className={clsx(
        "rounded-card border border-border bg-surface p-5 shadow-card transition-opacity duration-200",
        loading && value !== null && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-fg-muted">{label}</p>
        <span className={clsx("grid size-9 shrink-0 place-items-center rounded-lg", TONE_CHIP[tone])}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
      </div>

      {value === null ? (
        <div className="mt-3 h-8 w-28 animate-pulse rounded-md bg-surface-2" aria-hidden />
      ) : (
        <p className="mt-3 text-[28px] leading-none font-extrabold tracking-tight text-fg">{value}</p>
      )}

      {detail && <p className="mt-2 text-xs leading-snug text-fg-muted">{detail}</p>}

      {progress !== undefined && (
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clamp(progress, 0, 1) * 100)}
          aria-label="Part de l'objectif utilisée"
        >
          <div
            className={clsx("h-full rounded-full transition-[width] duration-300 ease-out", TONE_BAR[tone])}
            style={{ width: `${clamp(progress, 0, 1) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface KpiRowProps {
  result: PredictResponse | null;
  profile: ProfileResponse | null;
  reading: Reading;
  config: AppConfig | null;
  loading: boolean;
}

export function KpiRow({ result, profile, reading, config, loading }: KpiRowProps) {
  const highThreshold = config?.thresholds.high_consumption_wh ?? 500;
  const budgetRatio = result ? (result.financial.goal > 0 ? result.cost / result.financial.goal : 1) : 0;
  const financial = result ? FINANCIAL[result.financial.status] : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiTile
        icon={Zap}
        label="Consommation"
        value={result ? fmtWh(result.prediction) : null}
        detail="prédite sur un relevé de 10 minutes"
        tone={result && result.prediction > highThreshold ? "warn" : "brand"}
        loading={loading}
      />
      <KpiTile
        icon={Coins}
        label="Coût du relevé"
        value={result ? fmtTnd(result.cost) : null}
        detail={`à ${fmt(reading.electricity_price, 2)} TND/kWh`}
        loading={loading}
      />
      <KpiTile
        icon={PiggyBank}
        label="Budget restant"
        value={result ? fmtTnd(result.financial.remaining_budget) : null}
        detail={
          result
            ? `${fmtPercent(budgetRatio)} des ${fmtTnd(result.financial.goal, 2)} utilisés · ${financial?.label}`
            : `objectif ${fmtTnd(reading.financial_goal, 2)}`
        }
        tone={financial?.tone ?? "brand"}
        progress={result ? budgetRatio : undefined}
        loading={loading}
      />
      <KpiTile
        icon={CalendarDays}
        label="Coût sur 24 h"
        value={profile ? fmtTnd(profile.daily_cost, 2) : null}
        detail={profile ? `${fmtKwh(profile.daily_energy_wh)} à capteurs constants` : "profil journalier"}
        tone="neutral"
        loading={loading}
      />
    </div>
  );
}
