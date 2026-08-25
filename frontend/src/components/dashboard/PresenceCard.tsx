import { clsx } from "clsx";
import { Footprints, PersonStanding, UserX } from "lucide-react";

import type { AppConfig, PredictResponse } from "../../api/types";
import { fmtWh } from "../../lib/format";
import { MOVEMENT } from "../../lib/status";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

interface PresenceCardProps {
  result: PredictResponse | null;
  config: AppConfig | null;
}

export function PresenceCard({ result, config }: PresenceCardProps) {
  const detected = result?.movement.detected ?? false;
  const meta = result ? MOVEMENT[result.movement.status] : null;
  const idleThreshold = config?.thresholds.idle_consumption_wh ?? 300;
  const wasteSuspected = result ? !detected && result.prediction > idleThreshold : false;

  return (
    <Card id="presence" icon={Footprints} title="Présence" subtitle="Capteur de mouvement">
      <div className="flex flex-col items-center text-center">
        <div className="relative grid size-24 place-items-center">
          {detected && <span className="presence-ping absolute inset-0 rounded-full bg-brand/30" aria-hidden />}
          <span
            className={clsx(
              "relative grid size-20 place-items-center rounded-full border-4 transition-colors duration-300",
              detected ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface-2 text-fg-faint",
            )}
          >
            {detected ? <PersonStanding className="size-9" aria-hidden /> : <UserX className="size-9" aria-hidden />}
          </span>
        </div>

        <div className="mt-3 flex flex-col items-center gap-2">
          {meta ? <Badge tone={meta.tone}>{meta.label}</Badge> : <Badge tone="neutral">En attente d'analyse</Badge>}
          <p className="text-xs text-fg-muted">{result?.movement.message ?? "Indique si quelqu'un est présent dans la pièce."}</p>
        </div>

        {wasteSuspected && result && (
          <p className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-xs font-medium text-warn-fg">
            {fmtWh(result.prediction)} consommés sans personne dans la pièce : gaspillage probable.
          </p>
        )}
      </div>
    </Card>
  );
}
