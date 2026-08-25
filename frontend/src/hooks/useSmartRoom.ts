import { useCallback, useEffect, useRef, useState } from "react";

import { api, ApiError } from "../api/client";
import type {
  AppConfig,
  FinancialStatus,
  Health,
  HourlyReference,
  LoadStatus,
  PredictResponse,
  ProfileResponse,
  Reading,
  VoltageStatus,
} from "../api/types";
import { DEFAULT_READING } from "../lib/fields";
import { useLocalStorage } from "./useLocalStorage";

export type ConnectionState = "checking" | "online" | "degraded" | "offline";

export interface HistoryEntry {
  id: string;
  at: string;
  reading: Reading;
  prediction: number;
  cost: number;
  financial: FinancialStatus;
  voltage: VoltageStatus;
  load: LoadStatus;
  alerts: number;
}

const HISTORY_LIMIT = 40;
const AUTO_DELAY_MS = 450;

export const MODEL_MISSING_MESSAGE =
  "Le modèle IA n'est pas chargé : exécutez le notebook notebooks/smart_room_modeling.ipynb puis redémarrez le backend.";

function sameReading(a: Reading, b: Reading): boolean {
  return (Object.keys(a) as (keyof Reading)[]).every((key) => a[key] === b[key]);
}

function appendHistory(
  previous: HistoryEntry[],
  reading: Reading,
  result: PredictResponse,
  at: string,
): HistoryEntry[] {
  const last = previous[0];
  if (last && sameReading(last.reading, reading)) {
    return previous;
  }

  const entry: HistoryEntry = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at,
    reading,
    prediction: result.prediction,
    cost: result.cost,
    financial: result.financial.status,
    voltage: result.voltage.status,
    load: result.load.status,
    alerts: result.advice.filter((item) => item.level !== "info").length,
  };

  return [entry, ...previous].slice(0, HISTORY_LIMIT);
}

export function useSmartRoom() {
  const [reading, setReading] = useState<Reading>(DEFAULT_READING);
  const [health, setHealth] = useState<Health | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("checking");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [reference, setReference] = useState<HourlyReference[]>([]);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [auto, setAuto] = useLocalStorage<boolean>("smart-room-auto", true);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("smart-room-history", []);

  // Numéro de la dernière requête lancée : les réponses plus anciennes sont ignorées.
  const requestId = useRef(0);

  const connect = useCallback(async () => {
    setConnection("checking");
    try {
      const [healthResponse, configResponse, referenceResponse] = await Promise.all([
        api.health(),
        api.config(),
        api.reference(),
      ]);
      setHealth(healthResponse);
      setConfig(configResponse);
      setReference(referenceResponse);
      setConnection(healthResponse.model_loaded ? "online" : "degraded");
      setError(healthResponse.model_loaded ? null : MODEL_MISSING_MESSAGE);
    } catch (caught) {
      setConnection("offline");
      setError(caught instanceof Error ? caught.message : "API injoignable.");
    }
  }, []);

  useEffect(() => {
    void connect();
  }, [connect]);

  const analyze = useCallback(
    async (input: Reading) => {
      const id = ++requestId.current;
      setLoading(true);

      try {
        const [prediction, dailyProfile] = await Promise.all([api.predict(input), api.profile(input)]);
        if (id !== requestId.current) return;

        const now = new Date().toISOString();
        setResult(prediction);
        setProfile(dailyProfile);
        setFieldErrors({});
        setError(null);
        setUpdatedAt(now);
        setHistory((previous) => appendHistory(previous, input, prediction, now));
        setConnection("online");
      } catch (caught) {
        if (id !== requestId.current) return;

        if (caught instanceof ApiError) {
          setFieldErrors(caught.fieldErrors);
          if (caught.status === 422) {
            // Les erreurs de champ suffisent : pas de bandeau global.
            setError(null);
          } else {
            setError(caught.message);
          }
          if (caught.isNetwork) setConnection("offline");
          else if (caught.status === 503) setConnection("degraded");
        } else {
          setError("Erreur inattendue lors de l'analyse.");
        }
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [setHistory],
  );

  const modelReady = health?.model_loaded === true && connection !== "offline";

  // Analyse automatique, temporisée, à chaque modification des capteurs.
  useEffect(() => {
    if (!auto || !modelReady) return;
    const timer = window.setTimeout(() => {
      void analyze(reading);
    }, AUTO_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [auto, modelReady, reading, analyze]);

  const updateField = useCallback(<K extends keyof Reading>(key: K, value: Reading[K]) => {
    setReading((previous) => ({ ...previous, [key]: value }));
  }, []);

  const applyPreset = useCallback((values: Partial<Reading>) => {
    setReading((previous) => ({ ...previous, ...values }));
  }, []);

  const resetReading = useCallback(() => setReading(DEFAULT_READING), []);

  const restoreEntry = useCallback((entry: HistoryEntry) => setReading(entry.reading), []);

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  const runAnalysis = useCallback(() => {
    void analyze(reading);
  }, [analyze, reading]);

  return {
    reading,
    health,
    connection,
    config,
    reference,
    result,
    profile,
    loading,
    error,
    fieldErrors,
    updatedAt,
    auto,
    setAuto,
    history,
    modelReady,
    connect,
    runAnalysis,
    updateField,
    applyPreset,
    resetReading,
    restoreEntry,
    clearHistory,
  };
}

export type SmartRoom = ReturnType<typeof useSmartRoom>;
