import { clsx } from "clsx";
import { useEffect, useState, type CSSProperties } from "react";

import type { FieldDef } from "../../lib/fields";
import { clamp } from "../../lib/format";

interface SensorFieldProps {
  def: FieldDef;
  value: number;
  error?: string;
  onChange: (value: number) => void;
}

function formatInput(value: number, digits: number): string {
  return Number.isFinite(value) ? String(Number(value.toFixed(digits))) : "";
}

export function SensorField({ def, value, error, onChange }: SensorFieldProps) {
  const { key, label, unit, min, max, step, digits, icon: Icon, hint } = def;
  const [text, setText] = useState(() => formatInput(value, digits));
  const [focused, setFocused] = useState(false);

  // Le champ texte suit la valeur (curseur, préréglage) sauf pendant la saisie.
  useEffect(() => {
    if (!focused) setText(formatInput(value, digits));
  }, [value, digits, focused]);

  const inputId = `field-${key}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const ratio = clamp((value - min) / (max - min), 0, 1);

  function handleText(raw: string) {
    setText(raw);
    const parsed = Number(raw.replace(",", "."));
    if (raw.trim() !== "" && Number.isFinite(parsed)) {
      onChange(parsed);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="flex items-center gap-2 text-sm font-medium text-fg">
          <Icon className="size-4 shrink-0 text-fg-faint" aria-hidden />
          {label}
        </label>

        <div
          className={clsx(
            "flex items-center rounded-lg border bg-surface-2 transition-colors focus-within:ring-2 focus-within:ring-[var(--ring)]",
            error ? "border-bad" : "border-border focus-within:border-brand",
          )}
        >
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={text}
            onChange={(event) => handleText(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setText(formatInput(value, digits));
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className="h-10 w-[4.75rem] bg-transparent px-2 text-right text-sm font-semibold tabular-nums text-fg outline-none"
          />
          <span className="pr-2.5 text-xs font-medium text-fg-muted">{unit}</span>
        </div>
      </div>

      <input
        type="range"
        className="slider mt-2.5 w-full"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={`${label} (curseur)`}
        style={{ "--fill": `${ratio * 100}%` } as CSSProperties}
      />

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-bad-fg">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-fg-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
