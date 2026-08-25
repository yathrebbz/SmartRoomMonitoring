import {
  Clock,
  CloudDrizzle,
  CloudSun,
  Coins,
  Droplets,
  Gauge,
  Lightbulb,
  Moon,
  Plug,
  ShieldCheck,
  Sofa,
  Sun,
  Target,
  Thermometer,
  TriangleAlert,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { NumericReadingKey, Reading } from "../api/types";

export interface FieldDef {
  key: NumericReadingKey;
  label: string;
  unit: string;
  /** Bornes du curseur (l'API garde ses propres limites de validation). */
  min: number;
  max: number;
  step: number;
  digits: number;
  icon: LucideIcon;
  hint?: string;
}

export const ENVIRONMENT_FIELDS: FieldDef[] = [
  { key: "hour", label: "Heure", unit: "h", min: 0, max: 23, step: 1, digits: 0, icon: Clock },
  { key: "temperature", label: "Température", unit: "°C", min: 5, max: 35, step: 0.1, digits: 1, icon: Thermometer },
  { key: "humidity", label: "Humidité", unit: "%", min: 0, max: 100, step: 1, digits: 0, icon: Droplets },
  {
    key: "light_level",
    label: "Niveau de lumière",
    unit: "Wh",
    min: 0,
    max: 80,
    step: 1,
    digits: 0,
    icon: Lightbulb,
    hint: "Énergie des luminaires sur 10 min, comme dans le dataset.",
  },
  { key: "pressure", label: "Pression", unit: "mmHg", min: 700, max: 780, step: 0.5, digits: 1, icon: Gauge },
  { key: "outdoor_temperature", label: "Température extérieure", unit: "°C", min: -10, max: 40, step: 0.5, digits: 1, icon: CloudSun },
  { key: "dewpoint", label: "Point de rosée", unit: "°C", min: -10, max: 25, step: 0.5, digits: 1, icon: CloudDrizzle },
];

export const ELECTRICAL_FIELDS: FieldDef[] = [
  { key: "voltage", label: "Tension", unit: "V", min: 180, max: 280, step: 1, digits: 0, icon: Zap },
  { key: "current", label: "Courant", unit: "A", min: 0, max: 20, step: 0.1, digits: 1, icon: Plug },
  { key: "max_current", label: "Courant maximal", unit: "A", min: 1, max: 32, step: 1, digits: 0, icon: ShieldCheck },
];

export const FINANCE_FIELDS: FieldDef[] = [
  { key: "electricity_price", label: "Prix de l'électricité", unit: "TND/kWh", min: 0.05, max: 1, step: 0.01, digits: 2, icon: Coins },
  { key: "financial_goal", label: "Objectif par relevé", unit: "TND", min: 0.01, max: 1, step: 0.01, digits: 2, icon: Target },
];

export const DEFAULT_READING: Reading = {
  hour: 17,
  temperature: 22,
  humidity: 45,
  light_level: 40,
  pressure: 733,
  outdoor_temperature: 20,
  dewpoint: 5,
  electricity_price: 0.3,
  financial_goal: 0.15,
  movement: false,
  voltage: 230,
  current: 5,
  max_current: 10,
};

export interface Preset {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  values: Partial<Reading>;
}

export const PRESETS: Preset[] = [
  {
    id: "evening",
    label: "Soirée en famille",
    description: "19 h, pièce occupée, éclairage et appareils allumés",
    icon: Sofa,
    values: { hour: 19, temperature: 22.5, humidity: 48, light_level: 50, movement: true, current: 7, voltage: 230 },
  },
  {
    id: "night",
    label: "Nuit",
    description: "2 h, pièce vide, tout est éteint",
    icon: Moon,
    values: { hour: 2, temperature: 19, humidity: 50, light_level: 0, movement: false, current: 1, voltage: 230 },
  },
  {
    id: "summer",
    label: "Après-midi d'été",
    description: "15 h, 31 °C dehors, pièce vide",
    icon: Sun,
    values: {
      hour: 15,
      temperature: 26,
      humidity: 40,
      light_level: 10,
      outdoor_temperature: 31,
      dewpoint: 16,
      movement: false,
      current: 4,
      voltage: 230,
    },
  },
  {
    id: "fault",
    label: "Incident électrique",
    description: "Surtension et courant proche de la limite",
    icon: TriangleAlert,
    values: { hour: 18, voltage: 262, current: 9.5, movement: false },
  },
];
