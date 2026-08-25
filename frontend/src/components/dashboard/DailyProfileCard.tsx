import { clsx } from "clsx";
import { ChartArea, Table2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { HourlyReference, ProfileResponse } from "../../api/types";
import { fmt, fmtHour, fmtKwh, fmtTnd, fmtWh } from "../../lib/format";
import { Card } from "../ui/Card";

interface Row {
  hour: number;
  prediction: number;
  hourly_energy_wh: number;
  hourly_cost: number;
  reference: number | null;
}

interface DailyProfileCardProps {
  profile: ProfileResponse | null;
  reference: HourlyReference[];
  currentHour: number;
  loading: boolean;
}

type View = "chart" | "table";

function ProfileTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload: Row }> }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-card">
      <p className="font-bold text-fg">
        {row.hour} h – {row.hour + 1} h
      </p>
      <p className="mt-1.5 flex items-center gap-2 text-fg-muted">
        <span className="size-2 rounded-full bg-[var(--series-1)]" aria-hidden />
        Votre pièce
        <span className="ml-auto font-semibold text-fg tabular-nums">{fmtWh(row.prediction)}</span>
      </p>
      {row.reference !== null && (
        <p className="mt-1 flex items-center gap-2 text-fg-muted">
          <span className="size-2 rounded-full bg-[var(--series-ref)]" aria-hidden />
          Référence (médiane)
          <span className="ml-auto font-semibold text-fg tabular-nums">{fmtWh(row.reference)}</span>
        </p>
      )}
      <p className="mt-1.5 border-t border-border pt-1.5 text-fg-muted">
        Coût de l'heure : <span className="font-semibold text-fg tabular-nums">{fmtTnd(row.hourly_cost)}</span>
      </p>
    </div>
  );
}

export function DailyProfileCard({ profile, reference, currentHour, loading }: DailyProfileCardProps) {
  const [view, setView] = useState<View>("chart");
  const hasReference = reference.length === 24;

  const rows = useMemo<Row[]>(() => {
    if (!profile) return [];
    return profile.points.map((point) => ({
      ...point,
      reference: hasReference ? reference[point.hour].median : null,
    }));
  }, [profile, reference, hasReference]);

  return (
    <Card
      id="profile"
      icon={TrendingUp}
      title="Profil de consommation sur 24 h"
      subtitle="Prédiction heure par heure, capteurs constants"
      actions={
        <div role="group" aria-label="Affichage" className="flex rounded-lg border border-border bg-surface-2 p-0.5">
          {(
            [
              { id: "chart", label: "Graphique", icon: ChartArea },
              { id: "table", label: "Tableau", icon: Table2 },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              aria-pressed={view === id}
              className={clsx(
                "flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors duration-150",
                view === id ? "bg-surface text-fg shadow-card" : "text-fg-muted hover:text-fg",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      }
    >
      {!profile ? (
        <div className="grid h-[280px] place-items-center rounded-lg bg-surface-2/60 text-sm text-fg-muted">
          {loading ? "Calcul du profil…" : "Lancez une analyse pour afficher le profil journalier."}
        </div>
      ) : (
        <div className={clsx("transition-opacity duration-200", loading && "opacity-60")}>
          {view === "chart" ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-fg-muted">
                <span className="flex items-center gap-2">
                  <span className="h-0.5 w-5 rounded-full bg-[var(--series-1)]" aria-hidden />
                  Votre pièce (prédiction)
                </span>
                {hasReference && (
                  <span className="flex items-center gap-2">
                    <span className="h-0.5 w-5 rounded-full bg-[var(--series-ref)]" aria-hidden />
                    Référence dataset (médiane)
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <span className="h-3 w-0.5 rounded-full bg-brand/60" aria-hidden />
                  Heure sélectionnée
                </span>
              </div>

              <div className="h-[280px] w-full" role="img" aria-label={chartSummary(profile)}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="profileFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--grid)" />
                    <XAxis
                      dataKey="hour"
                      ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]}
                      tickFormatter={(hour: number) => `${hour}h`}
                      tick={{ fill: "var(--fg-faint)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--axis)" }}
                      tickLine={false}
                    />
                    <YAxis
                      width={48}
                      tick={{ fill: "var(--fg-faint)", fontSize: 12 }}
                      tickFormatter={(value: number) => fmt(value)}
                      axisLine={false}
                      tickLine={false}
                      unit=""
                    />
                    <Tooltip content={<ProfileTooltip />} cursor={{ stroke: "var(--axis)" }} />
                    <ReferenceLine x={currentHour} stroke="var(--brand)" strokeOpacity={0.55} strokeWidth={2} />
                    {hasReference && (
                      <Line
                        type="monotone"
                        dataKey="reference"
                        name="Référence (médiane)"
                        stroke="var(--series-ref)"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="prediction"
                      name="Votre pièce"
                      stroke="var(--series-1)"
                      strokeWidth={2}
                      fill="url(#profileFill)"
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface)", fill: "var(--series-1)" }}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="max-h-[300px] overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface-2 text-left text-xs text-fg-muted uppercase">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">Heure</th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold">Prédiction</th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold">Énergie / h</th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold">Coût / h</th>
                    {hasReference && <th scope="col" className="px-3 py-2 text-right font-semibold">Référence</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr key={row.hour} className={clsx(row.hour === currentHour && "bg-brand-soft/60")}>
                      <th scope="row" className="px-3 py-1.5 text-left font-medium text-fg">
                        {fmtHour(row.hour)}
                      </th>
                      <td className="px-3 py-1.5 text-right tabular-nums">{fmtWh(row.prediction)}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{fmtWh(row.hourly_energy_wh)}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{fmtTnd(row.hourly_cost)}</td>
                      {hasReference && (
                        <td className="px-3 py-1.5 text-right text-fg-muted tabular-nums">{fmtWh(row.reference ?? 0)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <dl className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-fg-muted">Pic de consommation</dt>
              <dd className="mt-0.5 text-sm font-bold text-fg">
                {fmtWh(profile.peak_prediction)} <span className="font-medium text-fg-muted">à {fmtHour(profile.peak_hour)}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fg-muted">Creux</dt>
              <dd className="mt-0.5 text-sm font-bold text-fg">
                {fmtWh(profile.lowest_prediction)} <span className="font-medium text-fg-muted">à {fmtHour(profile.lowest_hour)}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fg-muted">Énergie sur 24 h</dt>
              <dd className="mt-0.5 text-sm font-bold text-fg">
                {fmtKwh(profile.daily_energy_wh)} <span className="font-medium text-fg-muted">≈ {fmtTnd(profile.daily_cost, 2)}</span>
              </dd>
            </div>
          </dl>
        </div>
      )}
    </Card>
  );
}

function chartSummary(profile: ProfileResponse): string {
  return `Profil de consommation prédit sur 24 heures : pic de ${fmtWh(profile.peak_prediction)} à ${fmtHour(
    profile.peak_hour,
  )}, creux de ${fmtWh(profile.lowest_prediction)} à ${fmtHour(profile.lowest_hour)}, ${fmtKwh(
    profile.daily_energy_wh,
  )} sur la journée.`;
}
