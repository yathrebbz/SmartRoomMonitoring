// Types miroir des schémas Pydantic du backend (backend/schemas.py).

export type FinancialStatus = "good" | "warning" | "budget_exceeded";
export type MovementStatus = "occupied" | "empty";
export type VoltageStatus = "normal" | "overvoltage" | "undervoltage";
export type LoadStatus = "normal" | "warning" | "overload";
export type AdviceLevel = "info" | "warning" | "critical";

export interface SensorContext {
  temperature: number;
  humidity: number;
  light_level: number;
  pressure: number;
  outdoor_temperature: number;
  dewpoint: number;
}

export interface Reading extends SensorContext {
  hour: number;
  electricity_price: number;
  financial_goal: number;
  movement: boolean;
  voltage: number;
  current: number;
  max_current: number;
}

export type NumericReadingKey = Exclude<keyof Reading, "movement">;

export interface Advice {
  level: AdviceLevel;
  text: string;
}

export interface PredictResponse {
  prediction: number;
  cost: number;
  financial: {
    goal: number;
    remaining_budget: number;
    status: FinancialStatus;
    message: string;
  };
  movement: {
    detected: boolean;
    status: MovementStatus;
    message: string;
  };
  voltage: {
    value: number;
    status: VoltageStatus;
    message: string;
  };
  load: {
    current: number;
    max_current: number;
    status: LoadStatus;
    message: string;
  };
  advice: Advice[];
}

export interface ProfilePoint {
  hour: number;
  prediction: number;
  hourly_energy_wh: number;
  hourly_cost: number;
}

export interface ProfileResponse {
  points: ProfilePoint[];
  daily_energy_wh: number;
  daily_cost: number;
  peak_hour: number;
  peak_prediction: number;
  lowest_hour: number;
  lowest_prediction: number;
}

export interface HourlyReference {
  hour: number;
  mean: number;
  median: number;
  p90: number;
}

export interface Health {
  status: "ok";
  model_loaded: boolean;
  features: string[];
  reference_available: boolean;
}

export interface AppConfig {
  defaults: Record<string, number>;
  thresholds: Record<string, number>;
  readings_per_hour: number;
}
