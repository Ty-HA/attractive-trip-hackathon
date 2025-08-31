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

// Onboarding types and helpers
type TripType = 'city-break' | 'plage' | 'nature' | 'aventure' | 'romantique' | 'famille' | 'luxe' | 'workation';
type CompanionType = 'solo' | 'couple' | 'friends' | 'family';
type OriginCity = 'PAR' | 'LYS' | 'NCE' | 'TLS' | 'BDX' | 'STR';

interface OnboardingSlots {
  trip_type?: TripType;
  dates?: { from?: string; to?: string; flexible?: boolean };
  duration_days?: number;
  budget_total?: number;
  origin_city?: OriginCity;
  companions?: { type: CompanionType; adults?: number; kids_ages?: number[] };
  interests?: string[];
  constraints?: Record<string, any>;
  hotel_prefs?: Record<string, any>;
}

interface OnboardingQuestion {
  slot: keyof OnboardingSlots;
  hint?: string;
}

const ESSENTIAL_SLOTS: (keyof OnboardingSlots)[] = [
  'trip_type', 'budget_total', 'duration_days', 'companions', 'origin_city'
];

// Quick reply options
const QUICK_REPLIES = {
  trip_type: [
    { label: 'City-break', value: 'city-break', description: 'Villes et culture' },
    { label: 'Plage', value: 'plage', description: 'Soleil et détente' },
    { label: 'Nature', value: 'nature', description: 'Parcs et paysages' },
    { label: 'Aventure', value: 'aventure', description: 'Sensations fortes' },
    { label: 'Romantique', value: 'romantique', description: 'En amoureux' },
    { label: 'Famille', value: 'famille', description: 'Avec enfants' },
    { label: 'Luxe', value: 'luxe', description: 'Prestige et confort' },
    { label: 'Workation', value: 'workation', description: 'Travail et voyage' }
  ],
  budget_total: [
    { label: '< 500€', value: 500, description: 'Budget serré' },
    { label: '500-1000€', value: 1000, description: 'Économique' },
    { label: '1000-2000€', value: 2000, description: 'Confortable' },
    { label: '2000-3500€', value: 3500, description: 'Premium' },
    { label: '3500€+', value: 5000, description: 'Luxe' }
  ],
  duration_days: [
    { label: '2-4 jours', value: 3, description: 'Week-end prolongé' },
    { label: '5-7 jours', value: 6, description: 'Une semaine' },
    { label: '8-14 jours', value: 10, description: 'Deux semaines' },
    { label: '15+ jours', value: 21, description: 'Long séjour' }
  ],
  companions: [
    { label: 'Solo', value: 'solo', description: 'Je voyage seul(e)' },
    { label: 'En couple', value: 'couple', description: 'À deux' },
    { label: 'Entre amis', value: 'friends', description: 'Avec des amis' },
    { label: 'En famille', value: 'family', description: 'Avec enfants' }
  ],
  origin_city: [
    { label: 'Paris', value: 'PAR', description: 'CDG/ORY' },
    { label: 'Lyon', value: 'LYS', description: 'Saint-Exupéry' },
    { label: 'Nice', value: 'NCE', description: 'Côte d\'Azur' },
    { label: 'Toulouse', value: 'TLS', description: 'Blagnac' },
    { label: 'Bordeaux', value: 'BDX', description: 'Mérignac' },
    { label: 'Strasbourg', value: 'STR', description: 'Entzheim' }
  ]
};

// PlannerAgent helper functions
async function loadUserPreferences(supabase: any, user_id: string): Promise<OnboardingSlots | null> {
  if (!user_id) return null;
  
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();
    
    if (error || !data) return null;
    
    return {
      trip_type: data.trip_type,
      dates: data.dates,
      duration_days: data.duration_days,
      budget_total: data.budget_total,
      origin_city: data.origin_city,
      companions: data.companions,
      interests: data.interests,
      constraints: data.constraints,
      hotel_prefs: data.hotel_prefs
    };
  } catch (e) {
    console.error('Error loading user preferences:', e);
    return null;
  }
}

async function saveUserPreferences(supabase: any, user_id: string, slots: OnboardingSlots): Promise<void> {
  if (!user_id) return;
  
  try {
    const is_complete = ESSENTIAL_SLOTS.every(slot => slots[slot] !== undefined && slots[slot] !== null);
    
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id,
        ...slots,
        is_complete,
        completed_at: is_complete ? new Date().toISOString() : null
      });
    
    if (error) {
      console.error('Error saving user preferences:', error);
    }
  } catch (e) {
    console.error('Error saving user preferences:', e);
  }
}

function findNextMissingSlot(slots: OnboardingSlots): OnboardingQuestion | null {
  // Priority order for asking questions
  const slotOrder: (keyof OnboardingSlots)[] = [
    'trip_type',
    'companions', 
    'duration_days',
    'budget_total',
    'origin_city',
    'dates',
    'interests'
  ];
  
  for (const slot of slotOrder) {
    if (!slots[slot] || (Array.isArray(slots[slot]) && (slots[slot] as any[]).length === 0)) {
      return {
        slot,
        hint: getSlotHint(slot)
      };
    }
  }
  
  return null;
}

function getSlotHint(slot: keyof OnboardingSlots): string {
  const hints = {
    trip_type: 'Quel type de voyage vous intéresse ?',
    companions: 'Vous voyagez comment ?',
    duration_days: 'Combien de jours souhaitez-vous partir ?',
    budget_total: 'Quel est votre budget total ?',
    origin_city: 'De quelle ville partez-vous ?',
    dates: 'Avez-vous des dates précises ?',
    interests: 'Quels sont vos centres d\'intérêt ?',
    constraints: 'Avez-vous des contraintes particulières ?',
    hotel_prefs: 'Quelles sont vos préférences d\'hébergement ?'
  };
  return hints[slot] || 'Pouvez-vous préciser ?';
}

function parseUserResponse(message: string, question: OnboardingQuestion): any {
  const slot = question.slot;
  const lowerMessage = message.toLowerCase();
  
  switch (slot) {
    case 'trip_type':
      if (lowerMessage.includes('city') || lowerMessage.includes('ville')) return 'city-break';
      if (lowerMessage.includes('plage') || lowerMessage.includes('mer')) return 'plage';
      if (lowerMessage.includes('nature') || lowerMessage.includes('montagne')) return 'nature';
      if (lowerMessage.includes('aventure') || lowerMessage.includes('sport')) return 'aventure';
      if (lowerMessage.includes('romantique') || lowerMessage.includes('amoureux')) return 'romantique';
      if (lowerMessage.includes('famille') || lowerMessage.includes('enfant')) return 'famille';
      if (lowerMessage.includes('luxe') || lowerMessage.includes('prestige')) return 'luxe';
      if (lowerMessage.includes('workation') || lowerMessage.includes('travail')) return 'workation';
      break;
      
    case 'companions':
      if (lowerMessage.includes('solo') || lowerMessage.includes('seul')) return { type: 'solo', adults: 1 };
      if (lowerMessage.includes('couple') || lowerMessage.includes('deux')) return { type: 'couple', adults: 2 };
      if (lowerMessage.includes('amis') || lowerMessage.includes('groupe')) return { type: 'friends', adults: 3 };
      if (lowerMessage.includes('famille') || lowerMessage.includes('enfant')) return { type: 'family', adults: 2, kids_ages: [] };
      break;
      
    case 'duration_days':
      const days = parseInt(message.match(/\d+/)?.[0] || '0');
      if (days > 0) return days;
      if (lowerMessage.includes('week-end')) return 3;
      if (lowerMessage.includes('semaine')) return 7;
      break;
      
    case 'budget_total':
      const budget = parseInt(message.match(/\d+/)?.[0] || '0');
      if (budget > 0) return budget;
      break;
      
    case 'origin_city':
      if (lowerMessage.includes('paris') || lowerMessage.includes('cdg') || lowerMessage.includes('ory')) return 'PAR';
      if (lowerMessage.includes('lyon')) return 'LYS';
      if (lowerMessage.includes('nice') || lowerMessage.includes('côte')) return 'NCE';
      if (lowerMessage.includes('toulouse')) return 'TLS';
      if (lowerMessage.includes('bordeaux')) return 'BDX';
      if (lowerMessage.includes('strasbourg')) return 'STR';
      break;
  }
  
  return null;
}

function isOnboardingComplete(slots: OnboardingSlots): boolean {
  return ESSENTIAL_SLOTS.every(slot => slots[slot] !== undefined && slots[slot] !== null);
}

async function generateRecommendations(supabase: any, slots: OnboardingSlots) {
  try {
    console.log("Generating recommendations for slots:", slots);
    
    // Base query for destinations
    let query = supabase
      .from('destinations')
      .select('*')
      .eq('is_published', true);
    
    // Apply filters based on slots
    if (slots.duration_days) {
      // Match duration with some flexibility
      query = query.gte('duration_days', Math.max(1, slots.duration_days - 2))
                   .lte('duration_days', slots.duration_days + 3);
    }
    
    if (slots.budget_total) {
      // Filter by budget with some flexibility
      query = query.lte('price_from', Math.round(slots.budget_total * 1.2));
    }
    
    // Trip type mapping to destination characteristics
    if (slots.trip_type) {
      switch (slots.trip_type) {
        case 'city-break':
          query = query.ilike('description', '%ville%').or('ilike("description", "%city%")').or('ilike("description", "%urban%")');
          break;
        case 'plage':
          query = query.ilike('description', '%plage%').or('ilike("description", "%mer%")').or('ilike("description", "%côte%")');
          break;
        case 'nature':
          query = query.ilike('description', '%nature%').or('ilike("description", "%montagne%")').or('ilike("description", "%parc%")');
          break;
        case 'famille':
          query = query.eq('difficulty_level', 'easy').or('eq("difficulty_level", "moderate")');
          break;
        case 'luxe':
          query = query.gte('price_from', 2000);
          break;
      }
    }
    
    const { data: destinations } = await query.limit(10);
    
    if (!destinations || destinations.length === 0) {
      // Fallback: get any published destinations
      const { data: fallbackDestinations } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_published', true)
        .limit(3);
      
      return fallbackDestinations || [];
    }
    
    // Sort by relevance (price match, duration match)
    const scored = destinations.map((dest: any) => {
      let score = 0;
      
      // Budget score (closer to budget = higher score)
      if (slots.budget_total && dest.price_from) {
        const budgetRatio = Math.min(dest.price_from / slots.budget_total, 1);
        score += (1 - Math.abs(budgetRatio - 0.8)) * 50; // Sweet spot at 80% of budget
      }
      
      // Duration score
      if (slots.duration_days && dest.duration_days) {
        const durationDiff = Math.abs(dest.duration_days - slots.duration_days);
        score += Math.max(0, 20 - durationDiff * 2);
      }
      
      // Featured destinations get bonus
      if (dest.is_featured) {
        score += 10;
      }
      
      return { ...dest, relevance_score: score };
    });
    
    // Return top 3, categorized as Good/Better/Best
    const sortedResults = scored
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 3)
      .map((dest, index) => ({
        id: dest.id,
        title: dest.title,
        country: dest.country,
        description: dest.description?.substring(0, 100) + '...',
        price: dest.price_from,
        duration_days: dest.duration_days,
        category: index === 0 ? 'Best' : index === 1 ? 'Better' : 'Good',
        highlights: dest.highlights?.slice(0, 3) || []
      }));
    
    return sortedResults;
    
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

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
    const { message = "", action, language = "fr", type = "conversation", user_id } = body;
    
    console.log("Request body:", JSON.stringify(body, null, 2));
    console.log("Detected language:", language);
    console.log("Request type:", type);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // ---- CONVERSATIONAL SYSTEM WITH CONTEXT ----
    let currentSlots = {};
    let conversationContext = "";
    
    if (type === 'conversation') {
      // Load existing preferences and conversation history if user is logged in
      if (user_id) {
        console.log("Processing conversation for user:", user_id);
        currentSlots = await loadUserPreferences(supabase, user_id) || {};
        
        // Get recent conversation history for context
        const { data: recentMessages } = await supabase
          .from('chat_history')
          .select('message, sender')
          .eq('user_id', user_id)
          .order('id', { ascending: false })
          .limit(10);
        
        if (recentMessages && recentMessages.length > 0) {
          conversationContext = recentMessages
            .reverse()
            .map(msg => `${msg.sender === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.message}`)
            .join('\n');
        }
        
        // ONBOARDING SLOT-FILLING (if not complete and user wants structured onboarding)
        if (!isOnboardingComplete(currentSlots) && message?.toLowerCase().includes('questionnaire')) {
          console.log("Current slots:", currentSlots);
          
          // Parse user response and update slots
          const nextQuestion = findNextMissingSlot(currentSlots);
          if (nextQuestion && message) {
            const parsedValue = parseUserResponse(message, nextQuestion);
            if (parsedValue !== null) {
              currentSlots[nextQuestion.slot] = parsedValue;
              await saveUserPreferences(supabase, user_id, currentSlots);
              console.log("Updated slot", nextQuestion.slot, "with:", parsedValue);
            }
          }
          
          // Check if onboarding is now complete
          if (isOnboardingComplete(currentSlots)) {
            console.log("Onboarding complete! Triggering search...");
            
            // Generate personalized recommendations
            const searchResults = await generateRecommendations(supabase, currentSlots);
            
            return new Response(
              JSON.stringify({
                response: `Parfait ! Voici 3 options qui correspondent exactement à vos critères :`,
                type: "conversation",
                suggestedActions: ["search"],
                slots: currentSlots,
                results: searchResults,
                is_complete: true
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Find next question to ask
          const nextMissingSlot = findNextMissingSlot(currentSlots);
          if (nextMissingSlot) {
            const quickReplies = QUICK_REPLIES[nextMissingSlot.slot as keyof typeof QUICK_REPLIES] || [];
            
            return new Response(
              JSON.stringify({
                response: nextMissingSlot.hint,
                type: "conversation",
                next_question: {
                  slot: nextMissingSlot.slot,
                  hint: nextMissingSlot.hint,
                  quick_replies: quickReplies
                },
                slots: currentSlots
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
      
      // CONTEXTUAL CONVERSATION (free form or onboarding complete)
      // Continue with Perplexity but with enhanced context
    }

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

1. CONVERSATION LIBRE ET NATURELLE:
- Comprends les demandes spontanées (ex: "Je veux voir des dauphins à Bali")
- MAINTIENS le contexte de la conversation précédente
- Si l'utilisateur mentionne une destination spécifique, RESTE sur ce sujet
- Ne change PAS de destination ou contexte sans demande explicite
- Réponds de façon conversationnelle et engageante

2. APPROCHE PROGRESSIVE ET STRUCTURÉE:
- TOUJOURS commencer par confirmer la demande et poser les questions essentielles :
  • Budget total ou fourchette de prix
  • Durée du séjour (combien de jours/nuits)
  • Dates de voyage (précises ou période souhaitée)
  • Nombre de personnes (couple, famille, groupe...)
- NE PAS donner de suggestions détaillées AVANT d'avoir ces informations
- Une fois ces infos obtenues, ALORS proposer des suggestions adaptées

3. PLANIFICATION CONTEXTUELLE:
- Extrais et mémorise les préférences exprimées (destination, activités, style)
- Adapte toutes les suggestions au budget et à la durée mentionnés
- Propose hébergements, activités, restaurants dans la fourchette de prix
- Donne des conseils pratiques adaptés au budget et à la saison

4. FORMAT DE RÉPONSE ENGAGEANT:
- Confirme d'abord l'intérêt pour la destination/activité mentionnée
- Pose les questions essentielles une par une (pas toutes d'un coup)
- Utilise un ton enthousiaste et personnalisé
- Une fois toutes les infos obtenues, propose des suggestions détaillées

EXEMPLE DE RÉPONSE CORRECTE:
User: "Week-end romantique à Paris"
Assistant: "Excellente idée ! Paris est parfait pour un week-end romantique 😍
Pour vous proposer les meilleures options, j'aurais besoin de quelques détails :
• Quel est votre budget approximatif pour ce week-end (hébergement + activités + repas) ?
• À quelle période souhaitez-vous partir ?
• Vous êtes combien de personnes ?"

IMPORTANT: Réponds TOUJOURS et UNIQUEMENT en français. POSE D'ABORD LES QUESTIONS ESSENTIELLES avant de détailler.`,
      en: `You are a conversational travel expert assistant that helps create personalized trips. You must:

1. FREE AND NATURAL CONVERSATION:
- Understand spontaneous requests (ex: "I want to see dolphins in Bali")
- MAINTAIN the context from previous conversation
- If user mentions a specific destination, STAY on this topic
- Do NOT change destination or context unless explicitly requested
- Respond conversationally and engagingly

2. PROGRESSIVE AND STRUCTURED APPROACH:
- ALWAYS start by confirming the request and asking essential questions:
  • Total budget or price range
  • Trip duration (how many days/nights)
  • Travel dates (specific or preferred period)
  • Number of people (couple, family, group...)
- DO NOT provide detailed suggestions BEFORE getting this information
- Once you have these details, THEN provide tailored suggestions

3. CONTEXTUAL PLANNING:
- Extract and remember expressed preferences (destination, activities, style)
- Adapt all suggestions to the mentioned budget and duration
- Propose accommodations, activities, restaurants within the price range
- Provide practical advice adapted to budget and season

4. ENGAGING RESPONSE FORMAT:
- First confirm enthusiasm for the mentioned destination/activity
- Ask essential questions one by one (not all at once)
- Use enthusiastic and personalized tone
- Once all info is obtained, provide detailed suggestions

EXAMPLE OF CORRECT RESPONSE:
User: "Romantic weekend in Paris"
Assistant: "Excellent choice! Paris is perfect for a romantic weekend 😍
To suggest the best options for you, I need a few details:
• What's your approximate budget for this weekend (accommodation + activities + meals)?
• When are you planning to travel?
• How many people will be traveling?"

IMPORTANT: Always respond ONLY in English. ASK ESSENTIAL QUESTIONS FIRST before providing details.`
    };

    const baseSystemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.fr;
    
    // Enhance system prompt with user context (moved outside the if block)
    let contextualSystemPrompt = baseSystemPrompt;
    if (typeof conversationContext !== 'undefined' && conversationContext) {
      contextualSystemPrompt += `\n\nCONTEXTE DE LA CONVERSATION PRÉCÉDENTE:\n${conversationContext}\n\nIMPORTANT: Continue cette conversation en gardant le même contexte et la même destination/thématique.`;
    }
    if (user_id && typeof currentSlots !== 'undefined' && Object.keys(currentSlots).length > 0) {
      contextualSystemPrompt += `\n\nPRÉFÉRENCES UTILISATEUR:\n${JSON.stringify(currentSlots, null, 2)}\n\nUtilise ces préférences pour personnaliser tes réponses.`;
    }

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
    console.log("Using contextual system prompt with conversation history");
    
    const text = await callPerplexityAPI(contextualSystemPrompt + contextInfo, message ?? "");
    
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