import { clsx } from "clsx";
import {
  CircleCheck,
  Footprints,
  Lightbulb,
  OctagonAlert,
  PiggyBank,
  Plug,
  TriangleAlert,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { AdviceLevel, PredictResponse } from "../../api/types";
import { ADVICE_TONE, FINANCIAL, LOAD, MOVEMENT, TONE_CHIP, VOLTAGE } from "../../lib/status";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

interface AdviceCardProps {
  result: PredictResponse | null;
  loading: boolean;
}

const LEVEL: Record<AdviceLevel, { icon: LucideIcon; label: string }> = {
  info: { icon: CircleCheck, label: "Information" },
  warning: { icon: TriangleAlert, label: "Attention" },
  critical: { icon: OctagonAlert, label: "Critique" },
};

export function AdviceCard({ result, loading }: AdviceCardProps) {
  const alerts = result ? result.advice.filter((item) => item.level !== "info").length : 0;

  const synthesis = result
    ? [
        { icon: PiggyBank, label: "Budget", meta: FINANCIAL[result.financial.status] },
        { icon: Zap, label: "Tension", meta: VOLTAGE[result.voltage.status] },
        { icon: Plug, label: "Charge", meta: LOAD[result.load.status] },
        { icon: Footprints, label: "Présence", meta: MOVEMENT[result.movement.status] },
      ]
    : [];

  return (
    <Card
      id="advice"
      icon={Lightbulb}
      title="Conseils intelligents"
      subtitle="Recommandations issues de l'analyse"
      className="flex flex-col"
      bodyClassName="flex flex-1 flex-col"
      actions={
        result && (
          <Badge tone={alerts === 0 ? "good" : alerts >= 2 ? "bad" : "warn"}>
            {alerts === 0 ? "Aucune alerte" : alerts === 1 ? "1 alerte" : `${alerts} alertes`}
          </Badge>
        )
      }
    >
      {!result ? (
        <p className="text-sm text-fg-muted">
          {loading ? "Analyse en cours…" : "Les conseils apparaîtront après la première analyse."}
        </p>
      ) : (
        <div className={clsx("flex flex-1 flex-col transition-opacity duration-200", loading && "opacity-60")}>
          <ul className="space-y-2.5" aria-live="polite">
            {result.advice.map((item, index) => {
              const level = LEVEL[item.level];
              const Icon = level.icon;
              return (
                <li key={`${item.level}-${index}`} className="flex gap-3 rounded-lg border border-border bg-surface-2/60 p-3">
                  <span className={clsx("grid size-8 shrink-0 place-items-center rounded-md", TONE_CHIP[ADVICE_TONE[item.level]])}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-fg">{item.text}</p>
                    <p className="mt-1 text-[11px] font-semibold tracking-wide text-fg-faint uppercase">{level.label}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto border-t border-border pt-4">
            <p className="mb-2.5 text-[11px] font-bold tracking-[0.12em] text-fg-faint uppercase">Synthèse</p>
            <ul className="space-y-2">
              {synthesis.map(({ icon: Icon, label, meta }) => (
                <li key={label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-fg-muted">
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </span>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
