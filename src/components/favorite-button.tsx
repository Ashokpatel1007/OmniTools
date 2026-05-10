
"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";

export function FavoriteButton({ slug, label = "Save" }: { slug: string; label?: string }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(slug);

  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={() => toggle(slug)}
      aria-pressed={active}
    >
      <Heart className={active ? "h-4 w-4 fill-current" : "h-4 w-4"} />
      {active ? "Saved" : label}
    </Button>
  );
}
