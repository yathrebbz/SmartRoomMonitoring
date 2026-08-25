import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function useLocalStorage<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Stockage indisponible : la valeur ne survit pas au rechargement.
    }
  }, [key, value]);

  return [value, setValue];
}
