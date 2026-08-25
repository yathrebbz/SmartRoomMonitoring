import { CircleCheck, OctagonAlert, Zap } from "lucide-react";

import type { AppConfig, PredictResponse } from "../../api/types";
import { clamp, fmt } from "../../lib/format";
import { VOLTAGE } from "../../lib/status";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

const MIN = 180;
const MAX = 280;
const CX = 100;
const CY = 96;
const RADIUS = 78;
const GAP = 1.2; // volts laissés vides entre deux bandes

interface VoltageGaugeProps {
  voltage: PredictResponse["voltage"] | null;
  config: AppConfig | null;
}

function angleFor(value: number): number {
  const ratio = clamp((value - MIN) / (MAX - MIN), 0, 1);
  return 180 - ratio * 180;
}

function point(angleDeg: number, radius: number) {
  const angle = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(angle), y: CY - radius * Math.sin(angle) };
}

function arc(from: number, to: number): string {
  const start = point(angleFor(from), RADIUS);
  const end = point(angleFor(to), RADIUS);
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function VoltageGauge({ voltage, config }: VoltageGaugeProps) {
  const under = config?.thresholds.undervoltage ?? 207;
  const over = config?.thresholds.overvoltage ?? 253;
  const value = voltage?.value ?? 230;
  const meta = voltage ? VOLTAGE[voltage.status] : null;
  const needle = point(angleFor(value), RADIUS - 2);

  return (
    <Card id="voltage" icon={Zap} title="Tension" subtitle={`Réseau nominal ${fmt(config?.defaults.voltage ?? 230)} V`}>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 116" className="w-full max-w-[260px]" role="img" aria-label={`Tension mesurée ${fmt(value)} volts`}>
          <path d={arc(MIN, under - GAP)} stroke="var(--bad)" strokeOpacity={0.35} strokeWidth={12} fill="none" />
          <path d={arc(under + GAP, over - GAP)} stroke="var(--good)" strokeOpacity={0.45} strokeWidth={12} fill="none" />
          <path d={arc(over + GAP, MAX)} stroke="var(--bad)" strokeOpacity={0.35} strokeWidth={12} fill="none" />

          <text x={CX - RADIUS} y={CY + 16} fontSize="9" fill="var(--fg-faint)" textAnchor="middle">
            {MIN}
          </text>
          <text x={CX + RADIUS} y={CY + 16} fontSize="9" fill="var(--fg-faint)" textAnchor="middle">
            {MAX}
          </text>
          <text x={point(angleFor(under), RADIUS + 16).x} y={point(angleFor(under), RADIUS + 16).y} fontSize="9" fill="var(--fg-faint)" textAnchor="middle">
            {fmt(under)}
          </text>
          <text x={point(angleFor(over), RADIUS + 16).x} y={point(angleFor(over), RADIUS + 16).y} fontSize="9" fill="var(--fg-faint)" textAnchor="middle">
            {fmt(over)}
          </text>

          <line
            x1={CX}
            y1={CY}
            x2={needle.x}
            y2={needle.y}
            stroke="var(--fg)"
            strokeWidth={2.5}
            strokeLinecap="round"
            className="transition-[x2,y2] duration-300 ease-out"
          />
          <circle cx={CX} cy={CY} r={5} fill="var(--surface)" stroke="var(--fg)" strokeWidth={2.5} />
        </svg>

        <p className="-mt-2 text-[32px] leading-none font-extrabold tracking-tight text-fg">
          {fmt(value)} <span className="text-base font-semibold text-fg-muted">V</span>
        </p>

        <div className="mt-3 flex flex-col items-center gap-2 text-center">
          {meta ? (
            <Badge tone={meta.tone} icon={meta.tone === "good" ? CircleCheck : OctagonAlert}>
              {meta.label}
            </Badge>
          ) : (
            <Badge tone="neutral">En attente d'analyse</Badge>
          )}
          <p className="text-xs text-fg-muted">{voltage?.message ?? `Plage normale : ${fmt(under)} – ${fmt(over)} V.`}</p>
        </div>
      </div>
    </Card>
  );
}
