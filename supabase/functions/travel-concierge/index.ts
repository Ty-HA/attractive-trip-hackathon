import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { message, type = 'general', context = {} } = await req.json();

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Créer le prompt système basé sur le type de requête
    let systemPrompt = '';
    
    switch (type) {
      case 'itinerary':
        systemPrompt = `Tu es un expert en voyages spécialisé dans la création d'itinéraires personnalisés. 
        Réponds toujours en français. Crée des itinéraires détaillés avec des recommandations de lieux, 
        d'activités, de restaurants et de logements. Tiens compte du budget, de la durée et des préférences 
        du voyageur.`;
        break;
      case 'destination':
        systemPrompt = `Tu es un guide de voyage expert qui connaît parfaitement les destinations du monde entier. 
        Réponds toujours en français. Fournis des informations détaillées sur les attractions, la culture locale, 
        la météo, les conseils pratiques et les expériences uniques à vivre.`;
        break;
      case 'booking':
        systemPrompt = `Tu es un assistant de réservation de voyage. Réponds toujours en français.
        Aide les utilisateurs à comprendre les options de réservation, les politiques d'annulation, 
        les meilleures périodes pour réserver et les astuces pour économiser.`;
        break;
      default:
        systemPrompt = `Tu es un concierge de voyage expert et bienveillant. Réponds toujours en français. 
        Tu aides les voyageurs avec tous leurs besoins : planification, recommandations, conseils pratiques, 
        informations sur les destinations, et résolution de problèmes de voyage.`;
    }

    // Ajouter le contexte si fourni
    if (context.destination) {
      systemPrompt += ` Le voyageur s'intéresse à la destination: ${context.destination}.`;
    }
    if (context.budget) {
      systemPrompt += ` Budget approximatif: ${context.budget}.`;
    }
    if (context.duration) {
      systemPrompt += ` Durée du voyage: ${context.duration}.`;
    }
    if (context.travelers) {
      systemPrompt += ` Nombre de voyageurs: ${context.travelers}.`;
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
          { role: 'system', content: systemPrompt },
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
        type: type,
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