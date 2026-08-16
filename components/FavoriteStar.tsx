"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type FavoriteStarProps = {
  itemType: "word" | "sentence" | "translation" | "essay";
  content: string;
  extra?: Record<string, string>;
  className?: string;
};

export function FavoriteStar({
  itemType,
  content,
  extra = {},
  className = "",
}: FavoriteStarProps) {
  const [userId, setUserId] = useState("");
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("content", content)
        .maybeSingle();
      setFavorited(!!data);
    }
    void init();
  }, [itemType, content]);

  async function toggle() {
    if (!userId || busy) return;
    setBusy(true);
    const supabase = createSupabaseBrowserClient();

    if (favorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("item_type", itemType)
        .eq("content", content);
      setFavorited(false);
    } else {
      await supabase.from("favorites").insert({
        user_id: userId,
        item_type: itemType,
        content,
        extra,
      });
      setFavorited(true);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={favorited ? "取消收藏" : "收藏"}
      className={`text-xl leading-none transition hover:scale-110 ${className}`}
      style={{ color: favorited ? "#f59e0b" : undefined }}
    >
      {favorited ? "★" : "☆"}
    </button>
  );
}
