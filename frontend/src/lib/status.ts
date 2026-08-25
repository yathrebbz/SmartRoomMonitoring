import type {
  AdviceLevel,
  FinancialStatus,
  LoadStatus,
  MovementStatus,
  VoltageStatus,
} from "../api/types";

export type Tone = "good" | "warn" | "bad" | "neutral" | "brand";

interface StatusMeta {
  tone: Tone;
  label: string;
}

export const FINANCIAL: Record<FinancialStatus, StatusMeta> = {
  good: { tone: "good", label: "Objectif respecté" },
  warning: { tone: "warn", label: "Proche de la limite" },
  budget_exceeded: { tone: "bad", label: "Objectif dépassé" },
};

export const VOLTAGE: Record<VoltageStatus, StatusMeta> = {
  normal: { tone: "good", label: "Tension normale" },
  overvoltage: { tone: "bad", label: "Surtension" },
  undervoltage: { tone: "bad", label: "Sous-tension" },
};

export const LOAD: Record<LoadStatus, StatusMeta> = {
  normal: { tone: "good", label: "Charge normale" },
  warning: { tone: "warn", label: "Proche de la limite" },
  overload: { tone: "bad", label: "Surcharge" },
};

export const MOVEMENT: Record<MovementStatus, StatusMeta> = {
  occupied: { tone: "brand", label: "Pièce occupée" },
  empty: { tone: "neutral", label: "Pièce vide" },
};

export const ADVICE_TONE: Record<AdviceLevel, Tone> = {
  info: "good",
  warning: "warn",
  critical: "bad",
};

/** Classes utilitaires par tonalité, pour les puces, icônes et barres. */
export const TONE_CHIP: Record<Tone, string> = {
  good: "bg-good-soft text-good-fg",
  warn: "bg-warn-soft text-warn-fg",
  bad: "bg-bad-soft text-bad-fg",
  neutral: "bg-surface-2 text-fg-muted",
  brand: "bg-brand-soft text-brand",
};

export const TONE_BAR: Record<Tone, string> = {
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
  neutral: "bg-fg-faint",
  brand: "bg-brand",
};

export const TONE_TEXT: Record<Tone, string> = {
  good: "text-good-fg",
  warn: "text-warn-fg",
  bad: "text-bad-fg",
  neutral: "text-fg-muted",
  brand: "text-brand",
};
