import { AdviceCard } from "./components/dashboard/AdviceCard";
import { DailyProfileCard } from "./components/dashboard/DailyProfileCard";
import { HistoryCard } from "./components/dashboard/HistoryCard";
import { KpiRow } from "./components/dashboard/KpiRow";
import { LoadMeter } from "./components/dashboard/LoadMeter";
import { PresenceCard } from "./components/dashboard/PresenceCard";
import { VoltageGauge } from "./components/dashboard/VoltageGauge";
import { ErrorBanner } from "./components/ErrorBanner";
import { SensorPanel } from "./components/sensors/SensorPanel";
import { TopBar } from "./components/TopBar";
import { useSmartRoom } from "./hooks/useSmartRoom";
import { useTheme } from "./hooks/useTheme";
import { fmtTime } from "./lib/format";

export default function App() {
  const room = useSmartRoom();
  const theme = useTheme();

  const errorTitle =
    room.connection === "offline"
      ? "API injoignable"
      : room.connection === "degraded"
        ? "Modèle IA non chargé"
        : "Analyse impossible";

  return (
    <div className="min-h-dvh">
      <a
        href="#dashboard"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-brand-fg"
      >
        Aller au tableau de bord
      </a>

      <TopBar
        connection={room.connection}
        onRetry={room.connect}
        themePreference={theme.preference}
        onCycleTheme={theme.cycle}
      />

      <main className="mx-auto grid max-w-[1480px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        <SensorPanel room={room} />

        <div id="dashboard" className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6" tabIndex={-1}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-fg">Tableau de bord</h1>
              <p className="text-sm text-fg-muted">
                Prédiction Random Forest de la consommation, coût et sécurité électrique de la pièce.
              </p>
            </div>
            {room.updatedAt && (
              <p className="text-xs text-fg-muted" aria-live="polite">
                Dernière analyse à {fmtTime(room.updatedAt)}
              </p>
            )}
          </div>

          {room.error && (
            <ErrorBanner
              title={errorTitle}
              message={room.error}
              onRetry={room.connection === "online" ? room.runAnalysis : room.connect}
            />
          )}

          <KpiRow result={room.result} profile={room.profile} reading={room.reading} config={room.config} loading={room.loading} />

          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <DailyProfileCard
              profile={room.profile}
              reference={room.reference}
              currentHour={room.reading.hour}
              loading={room.loading}
            />
            <AdviceCard result={room.result} loading={room.loading} />
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-3">
            <VoltageGauge voltage={room.result?.voltage ?? null} config={room.config} />
            <LoadMeter load={room.result?.load ?? null} config={room.config} />
            <PresenceCard result={room.result} config={room.config} />
          </div>

          <HistoryCard history={room.history} onRestore={room.restoreEntry} onClear={room.clearHistory} />
        </div>
      </main>

      <footer className="mx-auto max-w-[1480px] px-4 pt-2 pb-8 text-xs text-fg-faint sm:px-6 lg:px-8">
        Modèle Random Forest entraîné sur le dataset UCI « Appliances energy prediction » · API FastAPI ·
        Interface React.
      </footer>
    </div>
  );
}
