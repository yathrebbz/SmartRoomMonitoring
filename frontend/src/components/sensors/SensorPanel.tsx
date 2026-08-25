import { clsx } from "clsx";
import {
  ChevronDown,
  Footprints,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Thermometer,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import type { Reading } from "../../api/types";
import type { SmartRoom } from "../../hooks/useSmartRoom";
import {
  ELECTRICAL_FIELDS,
  ENVIRONMENT_FIELDS,
  FINANCE_FIELDS,
  PRESETS,
  type FieldDef,
} from "../../lib/fields";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Switch } from "../ui/Switch";
import { SensorField } from "./SensorField";

interface SensorPanelProps {
  room: SmartRoom;
}

function Group({ id, title, icon: Icon, children }: { id: string; title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div role="group" aria-labelledby={id} className="space-y-4">
      <h3 id={id} className="flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-fg-faint uppercase">
        <Icon className="size-3.5" aria-hidden />
        {title}
      </h3>
      {children}
    </div>
  );
}

export function SensorPanel({ room }: SensorPanelProps) {
  const { reading, fieldErrors, loading, auto, setAuto, modelReady } = room;
  const [open, setOpen] = useState(false);

  const renderFields = (fields: FieldDef[]) =>
    fields.map((def) => (
      <SensorField
        key={def.key}
        def={def}
        value={reading[def.key]}
        error={fieldErrors[def.key]}
        onChange={(value) => room.updateField(def.key, value)}
      />
    ));

  const isPresetActive = (values: Partial<Reading>) =>
    (Object.keys(values) as (keyof Reading)[]).every((key) => reading[key] === values[key]);

  return (
    <Card
      as="aside"
      id="sensors"
      icon={SlidersHorizontal}
      title="Capteurs & paramètres"
      subtitle="Simulez l'état de la pièce"
      className="self-start lg:sticky lg:top-[76px] lg:max-h-[calc(100dvh-92px)] lg:overflow-y-auto thin-scrollbar"
      bodyClassName={clsx(!open && "max-lg:hidden")}
      actions={
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="sensors-body"
          className="grid size-11 cursor-pointer place-items-center rounded-lg text-fg-muted hover:bg-surface-2 lg:hidden"
        >
          <ChevronDown className={clsx("size-5 transition-transform duration-200", open && "rotate-180")} aria-hidden />
          <span className="sr-only">{open ? "Replier les capteurs" : "Déplier les capteurs"}</span>
        </button>
      }
    >
      <div id="sensors-body" className="space-y-6">
        <Switch
          id="auto-analysis"
          label="Analyse automatique"
          description="Relance l'analyse à chaque modification"
          checked={auto}
          onChange={setAuto}
        />

        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.12em] text-fg-faint uppercase">Scénarios rapides</p>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => {
              const active = isPresetActive(preset.values);
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => room.applyPreset(preset.values)}
                  aria-pressed={active}
                  title={preset.description}
                  className={clsx(
                    "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors duration-150",
                    active
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-surface-2 text-fg-muted hover:border-border-strong hover:text-fg",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="leading-tight">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Group id="group-environment" title="Environnement" icon={Thermometer}>
          {renderFields(ENVIRONMENT_FIELDS)}
        </Group>

        <Group id="group-electrical" title="Électricité" icon={Zap}>
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
            <Switch
              id="movement"
              label="Mouvement détecté"
              description="Capteur de présence"
              checked={reading.movement}
              onChange={(value) => room.updateField("movement", value)}
            />
          </div>
          {renderFields(ELECTRICAL_FIELDS)}
        </Group>

        <Group id="group-finance" title="Finances" icon={Wallet}>
          {renderFields(FINANCE_FIELDS)}
        </Group>

        <div className="flex gap-2 border-t border-border pt-5">
          <Button
            variant="primary"
            icon={Play}
            loading={loading}
            disabled={!modelReady}
            onClick={room.runAnalysis}
            className="flex-1"
          >
            Analyser
          </Button>
          <Button variant="ghost" icon={RotateCcw} onClick={room.resetReading} aria-label="Réinitialiser les capteurs">
            <span className="sr-only sm:not-sr-only">Réinitialiser</span>
          </Button>
        </div>

        {!modelReady && (
          <p className="flex items-start gap-2 text-xs text-fg-muted">
            <Footprints className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            L'analyse sera possible dès que l'API et le modèle seront disponibles.
          </p>
        )}
      </div>
    </Card>
  );
}
