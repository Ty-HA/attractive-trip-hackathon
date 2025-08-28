import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, type = 'general', context = {}, action } = await req.json();

    // Initialize Supabase client for data access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const huggingFaceApiKey = Deno.env.get('HUGGING_FACE_API_KEY');
    
    if (!huggingFaceApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    // Handle specific actions (bookings, searches, etc.)
    if (action) {
      switch (action.type) {
        case 'search_destinations':
          const { data: destinations } = await supabase
            .from('destinations')
            .select('*')
            .eq('is_published', true)
            .ilike('title', `%${action.query || ''}%`);
          
          return new Response(JSON.stringify({ 
            type: 'search_results',
            results: destinations,
            message: `J'ai trouvé ${destinations?.length || 0} destinations correspondant à votre recherche.`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        case 'search_packages':
          const { data: packages } = await supabase
            .from('packages')
            .select('*')
            .eq('is_available', true)
            .ilike('title', `%${action.query || ''}%`);
          
          return new Response(JSON.stringify({ 
            type: 'search_results',
            results: packages,
            message: `J'ai trouvé ${packages?.length || 0} voyages organisés disponibles.`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        case 'search_activities':
          const { data: activities } = await supabase
            .from('activities')
            .select('*')
            .eq('is_available', true)
            .ilike('title', `%${action.query || ''}%`);
          
          return new Response(JSON.stringify({ 
            type: 'search_results',
            results: activities,
            message: `J'ai trouvé ${activities?.length || 0} activités disponibles.`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        case 'search_restaurants':
          const { data: restaurants } = await supabase
            .from('restaurants')
            .select('*')
            .eq('is_available', true)
            .ilike('name', `%${action.query || ''}%`);
          
          return new Response(JSON.stringify({ 
            type: 'search_results',
            results: restaurants,
            message: `J'ai trouvé ${restaurants?.length || 0} restaurants disponibles.`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        case 'get_package_details':
          const { data: packageDetails } = await supabase
            .from('packages')
            .select('*')
            .eq('id', action.id)
            .single();
          
          return new Response(JSON.stringify({ 
            type: 'package_details',
            package: packageDetails,
            message: `Voici les détails du voyage "${packageDetails?.title}".`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
      }
    }

    // Create enhanced system prompt with booking capabilities
    let systemPrompt = `Tu es un assistant de voyage conversationnel intelligent qui peut aider les utilisateurs à :
    - Rechercher et réserver des destinations, des voyages organisés, des activités et des restaurants
    - Fournir des conseils personnalisés sur les voyages
    - Traiter les demandes de réservation
    - Répondre aux questions sur les services

    Tu as accès aux fonctions suivantes :
    - search_destinations(query): rechercher des destinations
    - search_packages(query): rechercher des voyages organisés  
    - search_activities(query): rechercher des activités
    - search_restaurants(query): rechercher des restaurants
    - get_package_details(id): obtenir les détails d'un voyage

    IMPORTANT : Quand un utilisateur veut chercher ou réserver quelque chose, tu dois utiliser les fonctions appropriées.
    
    Réponds toujours en français de manière naturelle et conversationnelle.
    Si l'utilisateur veut réserver, guide-le étape par étape.`;

    // Analyze the message to determine if we need to call functions
    const needsSearch = message.toLowerCase().includes('cherch') || 
                       message.toLowerCase().includes('trouv') || 
                       message.toLowerCase().includes('voir') ||
                       message.toLowerCase().includes('réserv') ||
                       message.toLowerCase().includes('voyage') ||
                       message.toLowerCase().includes('activité') ||
                       message.toLowerCase().includes('destination') ||
                       message.toLowerCase().includes('restaurant');

    let contextInfo = '';
    if (needsSearch) {
      // Get some sample data to provide context
      const { data: sampleDestinations } = await supabase
        .from('destinations')
        .select('id, title, country, price_from')
        .eq('is_published', true)
        .limit(3);

      const { data: samplePackages } = await supabase
        .from('packages')
        .select('id, title, duration_days, price')
        .eq('is_available', true)
        .limit(3);

      const { data: sampleRestaurants } = await supabase
        .from('restaurants')
        .select('id, name, city, cuisine_type')
        .eq('is_available', true)
        .limit(3);

      contextInfo = `\n\nContexte disponible :
      Destinations : ${sampleDestinations?.map(d => `${d.title} (${d.country})`).join(', ')}
      Voyages : ${samplePackages?.map(p => `${p.title} (${p.duration_days} jours)`).join(', ')}
      Restaurants : ${sampleRestaurants?.map(r => `${r.name} (${r.cuisine_type}, ${r.city})`).join(', ')}`;
    }

    // Helper functions for robust HF parsing
    async function readHFJson(res: Response) {
      const txt = await res.text();
      // Log côté serveur uniquement (pour debug); limite la taille
      console.log('HF raw response (first 800 chars):', txt.slice(0, 800));
      try {
        return JSON.parse(txt);
      } catch {
        return txt; // cas rare: texte non-JSON (devrait pas arriver)
      }
    }

    function extractTextFromHF(data: any): string | null {
      // Cas le plus courant: [{ generated_text: "..." }]
      if (Array.isArray(data) && data.length && typeof data[0]?.generated_text === 'string') {
        return data[0].generated_text;
      }
      // Certains modèles renvoient un objet { generated_text: "..." }
      if (data && typeof data.generated_text === 'string') {
        return data.generated_text;
      }
      // Erreur HF standard
      if (data && data.error) {
        return `__ERR__: ${data.error}`;
      }
      // Message "loading" possible
      if (data && typeof data.estimated_time !== 'undefined') {
        return `__LOADING__: estimated_time=${data.estimated_time}s`;
      }
      return null;
    }

    function buildZephyrPrompt(system: string, user: string) {
      // ChatML-like pour Zephyr
      return `<|system|>\n${system}\n<|user|>\n${user}\n<|assistant|>\n`;
    }

    const HUGGINGFACE_MODEL = Deno.env.get('HUGGINGFACE_MODEL') ?? 'HuggingFaceH4/zephyr-7b-beta';

    console.log(`Sending request to Hugging Face API model=${HUGGINGFACE_MODEL}...`);

    const inputs = buildZephyrPrompt(systemPrompt + contextInfo, message);

    const response = await fetch(`https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        inputs,
        parameters: {
          max_new_tokens: 512,   // 1000 peut faire ramer certains endpoints
          temperature: 0.7,
          do_sample: true
        },
        options: {
          wait_for_model: true,  // évite le 503 à froid
          use_cache: true
        }
      }),
    });

    // Lis toujours le body pour voir l'erreur réelle HF
    const data = await readHFJson(response);

    if (!response.ok) {
      // On renvoie le vrai message d'erreur HF au client pour debug
      const msg = typeof data === 'string' ? data : (data?.error ?? `${response.status} ${response.statusText}`);
      console.error('Hugging Face API Error:', msg);
      throw new Error(`Hugging Face API error: ${msg}`);
    }

    let aiResponse = extractTextFromHF(data) ?? '';
    if (aiResponse.startsWith('__ERR__')) {
      // Erreur logique renvoyée par HF (ex: modèle en maintenance)
      throw new Error(aiResponse.replace('__ERR__:', '').trim());
    }
    if (aiResponse.startsWith('__LOADING__')) {
      // Modèle en warmup : renvoie un message clair côté client
      aiResponse = "Le modèle se réveille (quelques secondes). Réessaie ta question 👍";
    }

    // Optionnel: si tu veux enlever le préfixe prompt recraché
    const cut = aiResponse.lastIndexOf('<|assistant|>');
    if (cut !== -1) {
      aiResponse = aiResponse.slice(cut + '<|assistant|>'.length).trim();
    }

    console.log('Processed AI response:', aiResponse.slice(0, 200) + '...');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        type: 'conversation',
        suggestedActions: needsSearch ? ['search', 'book'] : [],
        usage: data.usage || {} 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in travel-concierge function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue lors de la génération de la réponse',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});