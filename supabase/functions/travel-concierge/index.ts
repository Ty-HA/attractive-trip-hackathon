// supabase/functions/travel-concierge/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getEnv(name: string, fallback?: string) {
  const v = Deno.env.get(name) ?? fallback ?? "";
  return v.trim();
}

const SUPABASE_URL = getEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

// ⭐ Harmonise le nom de ta clé HF ici : mets le VRAI nom que tu as saisi dans Supabase
const HF_API_KEY =
  getEnv("HUGGING_FACE_API_KEY") ||
  getEnv("HUGGINGFACE_API_KEY") ||
  getEnv("HUGGINGFACEHUB_API_TOKEN") ||
  getEnv("HF_TOKEN");

const HF_MODEL = getEnv("HUGGINGFACE_MODEL", "HuggingFaceH4/zephyr-7b-beta");

function buildZephyrPrompt(system: string, user: string) {
  // ChatML-like format supporté par Zephyr
  return `<|system|>\n${system}\n<|user|>\n${user}\n<|assistant|>\n`;
}

async function readHFJson(res: Response) {
  const txt = await res.text();
  console.log("HF raw (first 600 chars):", txt.slice(0, 600));
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}

function extractTextFromHF(data: any): string | null {
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text as string;
  if (data?.generated_text) return data.generated_text as string;
  if (data?.error) return `__ERR__: ${data.error}`;
  if (typeof data?.estimated_time !== "undefined") return `__LOADING__: ${data.estimated_time}s`;
  return null;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Sanity env check (sans exposer les valeurs)
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase envs: URL or SERVICE_ROLE_KEY");
    return new Response(JSON.stringify({ error: "Server not configured (Supabase envs)" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { message = "", action } = body as {
      message?: string;
      action?: { type: string; query?: string; id?: string };
    };

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ---- Actions "search_*" & details ----
    if (action?.type) {
      switch (action.type) {
        case "search_destinations": {
          const { data, error } = await supabase
            .from("destinations")
            .select("*")
            .eq("is_published", true)
            .ilike("title", `%${action.query ?? ""}%`);
          if (error) throw error;
          return new Response(
            JSON.stringify({
              type: "search_results",
              results: data,
              message: `J'ai trouvé ${data?.length ?? 0} destinations correspondant à votre recherche.`,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        case "search_packages": {
          const { data, error } = await supabase
            .from("packages")
            .select("*")
            .eq("is_available", true)
            .ilike("title", `%${action.query ?? ""}%`);
          if (error) throw error;
          return new Response(
            JSON.stringify({
              type: "search_results",
              results: data,
              message: `J'ai trouvé ${data?.length ?? 0} voyages organisés disponibles.`,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        case "search_activities": {
          const { data, error } = await supabase
            .from("activities")
            .select("*")
            .eq("is_available", true)
            .ilike("title", `%${action.query ?? ""}%`);
          if (error) throw error;
          return new Response(
            JSON.stringify({
              type: "search_results",
              results: data,
              message: `J'ai trouvé ${data?.length ?? 0} activités disponibles.`,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        case "search_restaurants": {
          const { data, error } = await supabase
            .from("restaurants")
            .select("*")
            .eq("is_available", true)
            .ilike("name", `%${action.query ?? ""}%`);
          if (error) throw error;
          return new Response(
            JSON.stringify({
              type: "search_results",
              results: data,
              message: `J'ai trouvé ${data?.length ?? 0} restaurants disponibles.`,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        case "get_package_details": {
          const { data, error } = await supabase
            .from("packages")
            .select("*")
            .eq("id", action.id)
            .single();
          if (error) throw error;
          return new Response(
            JSON.stringify({
              type: "package_details",
              package: data,
              message: `Voici les détails du voyage "${data?.title ?? ""}".`,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // ---- Conversation (HF) ----
    if (!HF_API_KEY) {
      console.error("Missing HF API key (check env name)");
      return new Response(
        JSON.stringify({ error: "HF not configured. Set HUGGING_FACE_API_KEY (or HF_TOKEN)." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Tu es un assistant de voyage conversationnel qui aide à:
- Rechercher et réserver des destinations, voyages organisés, activités et restaurants
- Donner des conseils personnalisés
- Guider l'utilisateur pas à pas pour réserver
Utilise un ton naturel en français.`;

    // Petit contexte (non bloquant)
    let contextInfo = "";
    try {
      const [{ data: d1 }, { data: d2 }, { data: d3 }] = await Promise.all([
        supabase.from("destinations").select("title,country").eq("is_published", true).limit(3),
        supabase.from("packages").select("title,duration_days").eq("is_available", true).limit(3),
        supabase.from("restaurants").select("name,city,cuisine_type").eq("is_available", true).limit(3),
      ]);
      contextInfo =
        `\n\nContexte:\nDestinations: ${d1?.map((d) => `${d.title} (${d.country})`).join(", ") ?? "—"}` +
        `\nVoyages: ${d2?.map((p) => `${p.title} (${p.duration_days} jours)`).join(", ") ?? "—"}` +
        `\nRestaurants: ${d3?.map((r) => `${r.name} (${r.cuisine_type}, ${r.city})`).join(", ") ?? "—"}`;
    } catch (e) {
      console.warn("Context fetch failed (non-blocking):", e);
    }

    const inputs = buildZephyrPrompt(systemPrompt + contextInfo, message ?? "");

    console.log(`HF call model=${HF_MODEL}`);
    const hfRes = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        inputs,
        parameters: { max_new_tokens: 512, temperature: 0.7, do_sample: true },
        options: { wait_for_model: true, use_cache: true },
      }),
    });

    const hfData = await readHFJson(hfRes);

    if (!hfRes.ok) {
      const msg =
        (typeof hfData === "string" ? hfData : hfData?.error) ??
        `${hfRes.status} ${hfRes.statusText}`;
      console.error("HF error:", msg);
      return new Response(JSON.stringify({ error: `Hugging Face API error: ${msg}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let text = extractTextFromHF(hfData) ?? "";
    if (text.startsWith("__ERR__")) {
      const m = text.replace("__ERR__:", "").trim();
      console.error("HF logical error:", m);
      return new Response(JSON.stringify({ error: m }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (text.startsWith("__LOADING__")) {
      text = "Le modèle se réveille (quelques secondes). Réessaie ta question 👍";
    }
    const cut = text.lastIndexOf("<|assistant|>");
    if (cut !== -1) text = text.slice(cut + "<|assistant|>".length).trim();

    return new Response(
      JSON.stringify({
        response: text,
        type: "conversation",
        suggestedActions:
          /\b(destination|voyage|activité|restaurant|chercher|trouver|réserver)\b/i.test(message ?? "")
            ? ["search", "book"]
            : [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("travel-concierge error:", error);
    return new Response(
      JSON.stringify({
        error: "Edge function failed",
        details: String(error?.message ?? error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});