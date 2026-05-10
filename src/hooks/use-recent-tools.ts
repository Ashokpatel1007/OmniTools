"use client";

import { useCallback, useEffect, useState } from "react";

function addUnique(arr: string[], value: string, limit = 12) {
  const next = [value, ...arr.filter((v) => v !== value)];
  return next.slice(0, limit);
}

export function useRecentTools() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("recent-tools");

    if (saved) {
      try {
        setRecent(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("recent-tools", JSON.stringify(recent));
  }, [recent]);

  // IMPORTANT:
  // useCallback prevents infinite rerenders
  const addRecent = useCallback((slug: string) => {
    setRecent((current) => {
      // prevent useless state updates
      if (current[0] === slug) return current;

      return addUnique(current, slug, 12);
    });
  }, []);

  return {
    recent,
    addRecent,
    setRecent,
  };
}