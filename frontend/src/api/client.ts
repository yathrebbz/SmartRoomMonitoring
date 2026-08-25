import type {
  AppConfig,
  Health,
  HourlyReference,
  PredictResponse,
  ProfileResponse,
  Reading,
} from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }
}

interface ValidationDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
  ctx?: Record<string, unknown>;
}

function translate(detail: ValidationDetail): string {
  const ctx = detail.ctx ?? {};
  switch (detail.type) {
    case "missing":
      return "Champ obligatoire.";
    case "greater_than_equal":
      return `Doit être supérieur ou égal à ${String(ctx.ge)}.`;
    case "less_than_equal":
      return `Doit être inférieur ou égal à ${String(ctx.le)}.`;
    case "greater_than":
      return `Doit être strictement supérieur à ${String(ctx.gt)}.`;
    case "less_than":
      return `Doit être strictement inférieur à ${String(ctx.lt)}.`;
    case "float_parsing":
    case "float_type":
    case "int_parsing":
    case "int_type":
    case "int_from_float":
      return "Nombre invalide.";
    case "bool_parsing":
    case "bool_type":
      return "Valeur oui/non attendue.";
    default:
      return detail.msg;
  }
}

function buildError(status: number, body: unknown): ApiError {
  const detail = (body as { detail?: unknown } | null)?.detail;

  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const item of detail as ValidationDetail[]) {
      const field = String(item.loc[item.loc.length - 1] ?? "");
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = translate(item);
      }
    }
    return new ApiError(status, "Certaines valeurs sont invalides : corrigez les champs signalés.", fieldErrors);
  }

  if (typeof detail === "string") {
    return new ApiError(status, detail);
  }

  return new ApiError(status, `Le serveur a répondu avec une erreur (${status}).`);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
    });
  } catch {
    throw new ApiError(
      0,
      "Impossible de contacter l'API. Vérifiez que le backend est démarré (python -m backend).",
    );
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw buildError(response.status, body);
  }

  return (await response.json()) as T;
}

function post<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(payload) });
}

export const api = {
  health: () => request<Health>("/api/health"),

  config: () => request<AppConfig>("/api/config"),

  reference: async (): Promise<HourlyReference[]> => {
    try {
      return await request<HourlyReference[]>("/api/reference/hourly");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }
      throw error;
    }
  },

  predict: (reading: Reading) => post<PredictResponse>("/api/predict", reading),

  profile: (reading: Reading) =>
    post<ProfileResponse>("/api/profile", {
      temperature: reading.temperature,
      humidity: reading.humidity,
      light_level: reading.light_level,
      pressure: reading.pressure,
      outdoor_temperature: reading.outdoor_temperature,
      dewpoint: reading.dewpoint,
      electricity_price: reading.electricity_price,
      financial_goal: reading.financial_goal,
    }),
};
