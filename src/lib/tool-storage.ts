export const FAVORITES_KEY = "omnitool:favorites";
export const RECENT_KEY = "omnitool:recent";
export const OUTPUTS_KEY = "omnitool:outputs";

export function readStoredList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function writeStoredList(key: string, value: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value.slice(0, 50)));
}

export function addUnique(value: string[], item: string, limit = 20) {
  return [item, ...value.filter((entry) => entry !== item)].slice(0, limit);
}
