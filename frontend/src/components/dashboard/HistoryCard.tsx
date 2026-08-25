import { clsx } from "clsx";
import { History, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

import type { HistoryEntry } from "../../hooks/useSmartRoom";
import { fmt, fmtTime, fmtTnd, fmtWh } from "../../lib/format";
import { FINANCIAL, LOAD, TONE_BAR, VOLTAGE } from "../../lib/status";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface HistoryCardProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onClear: () => void;
}

const PAGE = 8;

function SparkTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload: HistoryEntry }> }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-card">
      <p className="font-bold text-fg">{fmtTime(entry.at)}</p>
      <p className="text-fg-muted">
        {fmtWh(entry.prediction)} · {fmtTnd(entry.cost)}
      </p>
    </div>
  );
}

function StatusDot({ label, tone }: { label: string; tone: keyof typeof TONE_BAR }) {
  return (
    <span className="inline-flex items-center gap-1" title={label}>
      <span className={clsx("size-2 rounded-full", TONE_BAR[tone])} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function HistoryCard({ history, onRestore, onClear }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const series = useMemo(() => [...history].reverse().slice(-24), [history]);
  const visible = expanded ? history : history.slice(0, PAGE);

  return (
    <Card
      id="history"
      icon={History}
      title="Historique de session"
      subtitle="Analyses effectuées dans ce navigateur"
      actions={
        history.length > 0 && (
          <>
            <Badge tone="neutral">{history.length} analyse{history.length > 1 ? "s" : ""}</Badge>
            {confirmClear ? (
              <>
                <Button size="sm" variant="danger" icon={Trash2} onClick={() => { onClear(); setConfirmClear(false); }}>
                  Confirmer
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
                  Annuler
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setConfirmClear(true)}>
                Effacer
              </Button>
            )}
          </>
        )
      }
    >
      {history.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong p-6 text-center text-sm text-fg-muted">
          Aucune analyse pour l'instant. Modifiez un capteur ou lancez une analyse pour commencer l'historique.
        </div>
      ) : (
        <>
          {series.length > 1 && (
            <div className="mb-4 h-[90px] w-full" role="img" aria-label={`Évolution des ${series.length} dernières prédictions`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="historyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={[0, "auto"]} />
                  <Tooltip content={<SparkTooltip />} cursor={{ stroke: "var(--axis)" }} />
                  <Area
                    type="monotone"
                    dataKey="prediction"
                    stroke="var(--series-1)"
                    strokeWidth={2}
                    fill="url(#historyFill)"
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)", fill: "var(--series-1)" }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs text-fg-muted uppercase">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-semibold">Heure</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Scénario</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Prédiction</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Coût</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Statuts</th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-2/60">
                    <td className="py-2 pr-3 whitespace-nowrap text-fg-muted tabular-nums">{fmtTime(entry.at)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-fg">
                      {entry.reading.hour} h · {fmt(entry.reading.temperature, 1)} °C ·{" "}
                      {entry.reading.movement ? "occupée" : "vide"}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold text-fg tabular-nums">{fmtWh(entry.prediction)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmtTnd(entry.cost)}</td>
                    <td className="py-2 pr-3">
                      <span className="flex items-center gap-2">
                        <StatusDot label={`Budget : ${FINANCIAL[entry.financial].label}`} tone={FINANCIAL[entry.financial].tone} />
                        <StatusDot label={`Tension : ${VOLTAGE[entry.voltage].label}`} tone={VOLTAGE[entry.voltage].tone} />
                        <StatusDot label={`Charge : ${LOAD[entry.load].label}`} tone={LOAD[entry.load].tone} />
                        {entry.alerts > 0 && (
                          <span className="text-xs text-fg-muted">
                            {entry.alerts} alerte{entry.alerts > 1 ? "s" : ""}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => onRestore(entry)}>
                        Restaurer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {history.length > PAGE && (
            <div className="mt-3 text-center">
              <Button size="sm" variant="ghost" onClick={() => setExpanded((value) => !value)}>
                {expanded ? "Afficher moins" : `Afficher les ${history.length - PAGE} autres`}
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
