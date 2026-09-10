"use client";

import { useEffect } from "react";
import { createClient } from "../lib/supabaseClient";

const FALLBACK = {
  theme_primary_color: "#30302f",
  theme_accent_color: "#c2a17b",
  theme_background_color: "#f8f6f2",
  theme_surface_color: "#ffffff",
  theme_text_color: "#242423",
  theme_muted_text_color: "#746f68",
  theme_border_color: "#e8dfd5",
  theme_radius: 18,
};

export default function SiteThemeProvider({ children }) {
  useEffect(() => {
    let alive = true;
    async function loadTheme() {
      const supabase = createClient();
      const { data } = await supabase.from("site_settings").select("theme_primary_color,theme_accent_color,theme_background_color,theme_surface_color,theme_text_color,theme_muted_text_color,theme_border_color,theme_radius").eq("setting_key", "main").single();
      if (!alive) return;
      const t = { ...FALLBACK, ...(data || {}) };
      const s = document.documentElement.style;
      s.setProperty("--theme-primary", t.theme_primary_color || FALLBACK.theme_primary_color);
      s.setProperty("--theme-accent", t.theme_accent_color || FALLBACK.theme_accent_color);
      s.setProperty("--theme-background", t.theme_background_color || FALLBACK.theme_background_color);
      s.setProperty("--theme-surface", t.theme_surface_color || FALLBACK.theme_surface_color);
      s.setProperty("--theme-text", t.theme_text_color || FALLBACK.theme_text_color);
      s.setProperty("--theme-muted", t.theme_muted_text_color || FALLBACK.theme_muted_text_color);
      s.setProperty("--theme-border", t.theme_border_color || FALLBACK.theme_border_color);
      s.setProperty("--theme-radius", `${Number(t.theme_radius) || 18}px`);
    }
    loadTheme();
    return () => { alive = false; };
  }, []);
  return children;
}
