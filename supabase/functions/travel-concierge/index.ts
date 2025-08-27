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

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
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
    - Rechercher et réserver des destinations, des voyages organisés et des activités
    - Fournir des conseils personnalisés sur les voyages
    - Traiter les demandes de réservation
    - Répondre aux questions sur les services

    Tu as accès aux fonctions suivantes :
    - search_destinations(query): rechercher des destinations
    - search_packages(query): rechercher des voyages organisés  
    - search_activities(query): rechercher des activités
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
                       message.toLowerCase().includes('destination');

    let contextInfo = '';
    if (needsSearch) {
      // Get some sample data to provide context
      const { data: sampleDestinations } = await supabase
        .from('destinations')
        .select('id, title, country, price_from')
        .eq('is_published', true)
        .limit(5);

      const { data: samplePackages } = await supabase
        .from('packages')
        .select('id, title, duration_days, price')
        .eq('is_available', true)
        .limit(5);

      contextInfo = `\n\nContexte disponible :
      Destinations : ${sampleDestinations?.map(d => `${d.title} (${d.country}) - À partir de ${d.price_from}€`).join(', ')}
      Voyages : ${samplePackages?.map(p => `${p.title} (${p.duration_days} jours) - ${p.price}€`).join(', ')}`;
    }

    console.log('Sending request to DeepSeek API...');

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt + contextInfo },
          { role: 'user', content: message }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API Error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API Response received');

    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        type: 'conversation',
        suggestedActions: needsSearch ? ['search', 'book'] : [],
        usage: data.usage 
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