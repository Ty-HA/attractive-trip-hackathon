// supabase/functions/travel-agent/index.ts
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
const PERPLEXITY_API_KEY = getEnv("PERPLEXITY_API_KEY");
const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

interface TripPlan {
  origin: string;
  dates: { start: string; end: string };
  party: { adults: number; kids: number };
  interests: string[];
  constraints: { budget_eur?: number; co2_max_kg?: number };
  plan: Array<{
    day: number;
    location: string;
    stay?: { hotel_id: string; nights: number };
    activities?: Array<{ id: string; time: string; operator: string }>;
  }>;
}

// RAG lookup using vector similarity
async function ragLookup(supabase: any, query: string, topK = 5) {
  try {
    // Get embedding for the query
    const embedding = await getEmbedding(query);
    
    const { data, error } = await supabase
      .rpc('match_knowledge_snippets', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: topK
      });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('RAG lookup error:', error);
    return [];
  }
}

// Get OpenAI embedding
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

// Deep search using Perplexity
async function deepSearch(query: string, region?: string) {
  const systemPrompt = `You are a travel research assistant. Provide detailed, factual information about travel destinations, activities, and accommodations. Focus on practical details like prices, schedules, and booking information.`;
  
  const userPrompt = region ? `${query} in ${region}` : query;
  
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

// Trip planner agent
async function planTrip(supabase: any, request: string, language = 'en'): Promise<{ plan: TripPlan | null; explanation: string }> {
  try {
    // First, extract trip requirements using OpenAI
    const extractionPrompt = `Extract trip planning requirements from this request: "${request}"

Return a JSON object with:
{
  "destination": "primary destination",
  "duration_days": number,
  "interests": ["interest1", "interest2"],
  "budget_eur": number or null,
  "party_size": number,
  "style": "luxury/mid-range/budget/eco"
}`;

    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a travel requirements extractor. Return only valid JSON.' },
          { role: 'user', content: extractionPrompt }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    const extractionData = await extractionResponse.json();
    const requirements = JSON.parse(extractionData.choices[0].message.content);

    // Get relevant knowledge from RAG
    const ragResults = await ragLookup(supabase, `${requirements.destination} ${requirements.interests.join(' ')}`);
    
    // Get additional context from deep search
    const deepResults = await deepSearch(`${requirements.interests.join(' ')} in ${requirements.destination}`);

    // Create trip plan
    const planningPrompt = `Create a detailed trip plan based on:

Requirements: ${JSON.stringify(requirements)}

Available knowledge: ${ragResults.map(r => r.content).join('\n\n')}

Web research: ${deepResults}

Create a JSON trip plan with this structure:
{
  "origin": "DPS",
  "dates": {"start":"2025-10-12","end":"2025-10-19"},
  "party": {"adults":2, "kids":0},
  "interests": ["dolphins","eco-lodge","ubud"],
  "constraints": {"budget_eur":1800, "co2_max_kg": 600},
  "plan": [
    {"day":1,"location":"Ubud","stay":{"hotel_id":"eco_firefly","nights":3}},
    {"day":2,"activity":{"id":"lovina_dolphin_tour","time":"06:00","operator":"Edi Popeye"}}
  ]
}

And provide a human explanation of the plan.`;

    const planResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: `You are a professional travel planner. Respond in ${language}. Always provide both JSON plan and human explanation.` },
          { role: 'user', content: planningPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const planData = await planResponse.json();
    const response = planData.choices[0].message.content;
    
    // Extract JSON and explanation
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    const explanation = response.replace(/\{[\s\S]*\}/, '').trim();

    return { plan, explanation };

  } catch (error) {
    console.error('Trip planning error:', error);
    return { 
      plan: null, 
      explanation: language === 'fr' 
        ? "Désolé, je n'ai pas pu créer un plan de voyage. Pouvez-vous reformuler votre demande ?"
        : "Sorry, I couldn't create a trip plan. Could you please rephrase your request?"
    };
  }
}

// CO2 estimation (simple model)
function estimateCO2(itinerary: TripPlan): number {
  // Simple estimation factors (kg CO2)
  const factors = {
    flight_domestic: 0.2, // per km
    flight_international: 0.15, // per km
    hotel_night: 25, // per night
    activity: 5, // per activity
    transport_local: 0.1 // per km
  };

  let totalCO2 = 0;
  
  // Add flight emissions (rough estimate)
  totalCO2 += 500; // Base international flight
  
  // Add hotel emissions
  const totalNights = itinerary.plan.reduce((sum, day) => sum + (day.stay?.nights || 0), 0);
  totalCO2 += totalNights * factors.hotel_night;
  
  // Add activity emissions
  const totalActivities = itinerary.plan.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
  totalCO2 += totalActivities * factors.activity;

  return Math.round(totalCO2);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { message = "", action, language = "en" } = body;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle different actions
    switch (action?.type) {
      case "plan_trip": {
        const { plan, explanation } = await planTrip(supabase, message, language);
        
        if (plan) {
          // Estimate CO2
          plan.constraints = plan.constraints || {};
          plan.constraints.co2_max_kg = estimateCO2(plan);

          // Save trip plan
          const { data: tripData, error: tripError } = await supabase
            .from('trip_itineraries')
            .insert({
              origin: plan.origin,
              dates: plan.dates,
              party: plan.party,
              interests: plan.interests,
              constraints: plan.constraints,
              itinerary: plan,
              total_co2_kg: plan.constraints.co2_max_kg
            })
            .select()
            .single();

          if (tripError) throw tripError;

          return new Response(
            JSON.stringify({
              type: "trip_plan",
              plan: plan,
              trip_id: tripData.id,
              explanation: explanation,
              co2_estimate: plan.constraints.co2_max_kg,
              next_step: language === 'fr' 
                ? "Voulez-vous que je recherche les prix actuels et la disponibilité ?"
                : "Would you like me to search for current prices and availability?"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          return new Response(
            JSON.stringify({
              type: "error",
              message: explanation
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      case "search_deep": {
        const result = await deepSearch(action.query, action.region);
        return new Response(
          JSON.stringify({
            type: "search_result",
            content: result,
            source: "web"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "rag_lookup": {
        const results = await ragLookup(supabase, action.query, action.top_k || 5);
        return new Response(
          JSON.stringify({
            type: "rag_results",
            results: results,
            source: "knowledge_base"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default: {
        // General conversation - use RAG + Perplexity
        const ragResults = await ragLookup(supabase, message);
        let context = "";
        
        if (ragResults.length > 0) {
          context = `\n\nRelevant information from our knowledge base:\n${ragResults.map(r => r.content).join('\n\n')}`;
        }

        const systemPrompt = language === 'fr'
          ? `Tu es un assistant de voyage expert qui aide à créer des voyages personnalisés de A à Z. 

CAPACITÉS:
- Recherche approfondie de destinations et activités
- Planification d'itinéraires détaillés
- Estimation des coûts et impact CO₂
- Conseils sur durabilité et éco-tourisme
- Guidage vers réservations concrètes

STYLE DE RÉPONSE:
- Conversationnel et professionnel
- Pose des questions de suivi pour personnaliser
- Propose toujours des alternatives
- Termine par une action concrète ou question

IMPORTANT: Réponds UNIQUEMENT en français.${context}`
          : `You are an expert travel assistant that helps create personalized trips from A to Z.

CAPABILITIES:
- Deep research on destinations and activities
- Detailed itinerary planning
- Cost estimation and CO₂ impact
- Sustainability and eco-tourism advice
- Guidance towards concrete bookings

RESPONSE STYLE:
- Conversational and professional
- Ask follow-up questions to personalize
- Always offer alternatives
- End with a concrete action or question

IMPORTANT: Respond ONLY in English.${context}`;

        const deepResult = await deepSearch(message);

        return new Response(
          JSON.stringify({
            type: "conversation",
            response: deepResult,
            sources: {
              knowledge_base: ragResults.length,
              web_search: true
            },
            suggested_actions: ["plan_trip", "search_deep", "get_quotes"]
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

  } catch (error: unknown) {
    console.error("Travel agent error:", error);
    return new Response(
      JSON.stringify({
        error: "Travel agent failed",
        details: String((error as Error)?.message ?? error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});