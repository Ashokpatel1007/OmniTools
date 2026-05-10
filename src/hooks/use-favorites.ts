"use client";

import { useEffect, useState } from "react";
import { addUnique, FAVORITES_KEY, readStoredList, writeStoredList } from "@/lib/tool-storage";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFavorites(readStoredList(FAVORITES_KEY));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeStoredList(FAVORITES_KEY, favorites);
  }, [favorites, ready]);

  const toggle = (slug: string) =>
    setFavorites((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : addUnique(current, slug, 50)));
  const isFavorite = (slug: string) => favorites.includes(slug);

  return { favorites, toggle, isFavorite, setFavorites };
}
