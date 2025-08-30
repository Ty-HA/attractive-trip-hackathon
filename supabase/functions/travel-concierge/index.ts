// supabase/functions/travel-concierge/index.ts
// @ts-ignore - Deno runtime imports
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore - Deno runtime imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno runtime imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Type declarations for local IDE (ignored in Deno runtime)
declare global {
  const Deno: {
    env: {
      get(name: string): string | undefined;
    };
  };
}

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

// API Keys - trying multiple possible env var names
const PERPLEXITY_API_KEY = getEnv("PERPLEXITY_API_KEY") || getEnv("ERPLEXITY_API_KEY");

const PERPLEXITY_MODEL = getEnv("PERPLEXITY_MODEL", "sonar");

async function callPerplexityAPI(system: string, user: string) {
  const requestBody = {
    model: PERPLEXITY_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    max_tokens: 1024,
    temperature: 0.7,
    stream: false
  };

  console.log("Calling Perplexity with model:", PERPLEXITY_MODEL);
  console.log("Request body:", JSON.stringify(requestBody, null, 2));

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error("Perplexity API error response:", error);
    throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${error}`);
  }

  const data = await response.json();
  console.log("Perplexity response:", JSON.stringify(data, null, 2));
  return data.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Sanity env check (sans exposer les valeurs)
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase envs: URL or SERVICE_ROLE_KEY");
    return new Response(
      JSON.stringify({ error: "Server not configured (Supabase envs)" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { message = "", action, language = "fr" } = body;
    
    console.log("Request body:", JSON.stringify(body, null, 2));
    console.log("Detected language:", language);

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

    // ---- Conversation (Perplexity) ----
    console.log("Checking Perplexity API key...", PERPLEXITY_API_KEY ? "Found" : "Missing");
    if (!PERPLEXITY_API_KEY) {
      console.error("Missing Perplexity API key - check your environment variables");
      return new Response(
        JSON.stringify({ error: "Perplexity API not configured. Set PERPLEXITY_API_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompts = {
      fr: `Tu es un assistant de voyage conversationnel expert qui aide à créer des voyages sur mesure. Tu dois:

1. PLANIFICATION COMPLÈTE:
- Comprendre les préférences du voyageur (budget, dates, style de voyage, intérêts)
- Proposer un itinéraire détaillé jour par jour
- Suggérer hébergements, activités, restaurants, transports
- Donner des conseils pratiques (météo, culture, sécurité)

2. CONVERSATION NATURELLE:
- Poser des questions de suivi pour personnaliser le voyage
- Être proactif dans les suggestions
- Maintenir un ton amical et professionnel
- Guider vers une réservation complète

3. FORMAT DE RÉPONSE:
- Utilise des sections claires avec des titres
- Inclus des détails pratiques (prix, durées, horaires)
- Propose toujours des alternatives
- Termine par une question pour continuer la conversation

IMPORTANT: Réponds TOUJOURS et UNIQUEMENT en français.`,
      en: `You are a conversational travel expert assistant that helps create personalized trips. You must:

1. COMPLETE PLANNING:
- Understand traveler preferences (budget, dates, travel style, interests)
- Propose detailed day-by-day itineraries
- Suggest accommodations, activities, restaurants, transportation
- Provide practical advice (weather, culture, safety)

2. NATURAL CONVERSATION:
- Ask follow-up questions to personalize the trip
- Be proactive with suggestions
- Maintain a friendly and professional tone
- Guide towards complete booking

3. RESPONSE FORMAT:
- Use clear sections with titles
- Include practical details (prices, durations, schedules)
- Always offer alternatives
- End with a question to continue the conversation

IMPORTANT: Always respond ONLY in English. Never use French or any other language.`
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.fr;

    // Petit contexte (non bloquant)
    let contextInfo = "";
    try {
      const [{ data: d1 }, { data: d2 }, { data: d3 }] = await Promise.all([
        supabase.from("destinations").select("title,country").eq("is_published", true).limit(3),
        supabase.from("packages").select("title,duration_days").eq("is_available", true).limit(3),
        supabase.from("restaurants").select("name,city,cuisine_type").eq("is_available", true).limit(3)
      ]);
      contextInfo =
        `\n\nContexte:\nDestinations: ${d1?.map((d: { title: string; country: string }) => `${d.title} (${d.country})`).join(", ") ?? "—"}` +
        `\nVoyages: ${d2?.map((p: { title: string; duration_days: number }) => `${p.title} (${p.duration_days} jours)`).join(", ") ?? "—"}` +
        `\nRestaurants: ${d3?.map((r: { name: string; cuisine_type: string; city: string }) => `${r.name} (${r.cuisine_type}, ${r.city})`).join(", ") ?? "—"}`;
    } catch (e) {
      console.warn("Context fetch failed (non-blocking):", e);
    }

    console.log(`Perplexity call model=${PERPLEXITY_MODEL}`);
    
    const text = await callPerplexityAPI(systemPrompt + contextInfo, message ?? "");
    
    return new Response(
      JSON.stringify({ 
        response: text,
        type: "conversation",
        suggestedActions: /\b(destination|voyage|activité|restaurant|chercher|trouver|réserver)\b/i.test(message ?? "")
          ? ["search", "book"]
          : [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    console.error("travel-concierge error:", error);
    return new Response(
      JSON.stringify({
        error: "Edge function failed",
        details: String((error as Error)?.message ?? error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});