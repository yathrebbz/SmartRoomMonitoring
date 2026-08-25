import { clsx } from "clsx";
import { CircleCheck, OctagonAlert, Plug, TriangleAlert } from "lucide-react";

import type { AppConfig, PredictResponse } from "../../api/types";
import { clamp, fmt, fmtPercent } from "../../lib/format";
import { LOAD, TONE_BAR } from "../../lib/status";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

interface LoadMeterProps {
  load: PredictResponse["load"] | null;
  config: AppConfig | null;
}

export function LoadMeter({ load, config }: LoadMeterProps) {
  const warnRatio = config?.thresholds.current_warning_ratio ?? 0.8;
  const current = load?.current ?? 0;
  const max = load?.max_current ?? config?.defaults.max_current ?? 10;
  const ratio = max > 0 ? current / max : 0;
  const meta = load ? LOAD[load.status] : null;
  const tone = meta?.tone ?? "neutral";
  const Icon = tone === "good" ? CircleCheck : tone === "warn" ? TriangleAlert : OctagonAlert;

  return (
    <Card id="load" icon={Plug} title="Charge électrique" subtitle={`Limite ${fmt(max)} A · alerte à ${fmtPercent(warnRatio)}`}>
      <div className="flex items-baseline gap-2">
        <p className="text-[32px] leading-none font-extrabold tracking-tight text-fg">
          {fmt(current, 1)} <span className="text-base font-semibold text-fg-muted">A</span>
        </p>
        <p className="text-sm text-fg-muted">/ {fmt(max)} A</p>
      </div>

      <div className="relative mt-5 pb-5">
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-surface-2"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-label="Courant consommé"
        >
          <div
            className={clsx("h-full rounded-full transition-[width] duration-300 ease-out", TONE_BAR[tone === "neutral" ? "brand" : tone])}
            style={{ width: `${clamp(ratio, 0, 1) * 100}%` }}
          />
        </div>
        <div
          className="absolute top-[-4px] h-5 w-0.5 rounded-full bg-warn"
          style={{ left: `calc(${warnRatio * 100}% - 1px)` }}
          aria-hidden
        />
        <div className="absolute inset-x-0 top-4 flex justify-between text-[11px] text-fg-faint tabular-nums" aria-hidden>
          <span>0</span>
          <span className="text-warn-fg font-semibold" style={{ position: "absolute", left: `${warnRatio * 100}%`, transform: "translateX(-50%)" }}>
            {fmt(max * warnRatio, 1)} A
          </span>
          <span>{fmt(max)} A</span>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-start gap-2">
        {meta ? (
          <Badge tone={meta.tone} icon={Icon}>
            {meta.label}
          </Badge>
        ) : (
          <Badge tone="neutral">En attente d'analyse</Badge>
        )}
        <p className="text-xs text-fg-muted">{load?.message ?? "Utilisation actuelle du circuit par rapport à sa limite."}</p>
      </div>
    </Card>
  );
}
