import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Loader2, MapPin, Calendar, RotateCcw, Archive, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useDisplayName } from '@/hooks/useDisplayName';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  data?: 
    | { type: 'search_results'; results: SearchResult[]; category: string }
    | { type: 'booking_started'; item: SearchResult }
    | { type: 'quick_replies'; question: OnboardingQuestion }
    | undefined;
}

interface OnboardingQuestion {
  slot: string;
  hint: string;
  quick_replies?: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
}


interface SearchResult {
  id: string;
  title: string;
  price?: number;
  price_from?: number;
  duration_days?: number;
  country?: string;
  description?: string;
}

interface ConversationalAIProps {
  inline?: boolean;
  mobile?: boolean;
}

const ConversationalAI = ({ inline = false, mobile = false }: ConversationalAIProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const displayName = useDisplayName(user);
  console.log('ConversationalAI user:', user);
  console.log('ConversationalAI displayName:', displayName);

  const getWelcomeMessage = React.useCallback(() => {
    if (language === 'fr') {
      return `Bonjour${displayName ? ' ' + displayName : ''} ! 🌍✈️\n\nJe suis votre assistant de voyage intelligent. Je vais vous poser quelques questions pour créer le voyage parfait selon vos goûts et votre budget.\n\nCommençons ! Quel type de voyage vous fait rêver ?`;
    } else {
      return `Hello${displayName ? ' ' + displayName : ''}! 🌍✈️\n\nI'm your intelligent travel assistant. I'll ask you a few questions to create the perfect trip based on your preferences and budget.\n\nLet's start! What type of trip are you dreaming of?`;
    }
  }, [language, displayName]);

  const getOnboardingWelcomeQuestion = React.useCallback((): OnboardingQuestion => {
    return {
      slot: 'trip_type',
      hint: language === 'fr' 
        ? 'Quel type de voyage vous fait rêver ?'
        : 'What type of trip are you dreaming of?',
      quick_replies: [
        { label: 'City-break', value: 'city-break', description: language === 'fr' ? 'Villes et culture' : 'Cities and culture' },
        { label: 'Plage', value: 'plage', description: language === 'fr' ? 'Soleil et détente' : 'Sun and relaxation' },
        { label: 'Nature', value: 'nature', description: language === 'fr' ? 'Parcs et paysages' : 'Parks and landscapes' },
        { label: 'Aventure', value: 'aventure', description: language === 'fr' ? 'Sensations fortes' : 'Thrills and adventure' },
        { label: 'Romantique', value: 'romantique', description: language === 'fr' ? 'En amoureux' : 'Romantic getaway' },
        { label: 'Famille', value: 'famille', description: language === 'fr' ? 'Avec enfants' : 'With children' },
        { label: 'Luxe', value: 'luxe', description: language === 'fr' ? 'Prestige et confort' : 'Prestige and comfort' },
        { label: 'Workation', value: 'workation', description: language === 'fr' ? 'Travail et voyage' : 'Work and travel' }
      ]
    };
  }, [language]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canArchive, setCanArchive] = useState(false); // True when onboarding is complete
  const [currentConversationData, setCurrentConversationData] = useState<{
    slots?: Record<string, unknown>;
    results?: SearchResult[];
    preferences?: Record<string, unknown>;
  } | null>(null);

  // Récupérer l'historique du chat à l'initialisation
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        // Pas connecté : message d'accueil avec quick replies pour commencer l'onboarding
        setMessages([
          {
            id: '1',
            text: getWelcomeMessage(),
            sender: 'ai',
            timestamp: new Date(),
            data: { type: 'quick_replies', question: getOnboardingWelcomeQuestion() }
          }
        ]);
        return;
      }
      // Récupère l'historique depuis Supabase
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: true });
      if (error || !data) {
        // En cas d'erreur, fallback message d'accueil
        setMessages([
          {
            id: '1',
            text: getWelcomeMessage(),
            sender: 'ai',
            timestamp: new Date()
          }
        ]);
        return;
      }
      // Définir une interface pour les lignes d'historique du chat
      interface ChatHistoryRow {
        id: number | string;
        message: string;
        sender: 'user' | 'ai';
        created_at?: string;
      }
      // Transforme les messages pour le state local
      const historyMessages = data.map((msg: ChatHistoryRow) => ({
        id: msg.id?.toString() ?? Date.now().toString(),
        text: msg.message,
        sender: msg.sender,
        timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
      }));

      // Trie l'historique par date croissante (sécurité)
      historyMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Regroupe les messages pour garantir l'ordre question puis réponse
      const grouped: Message[] = [];
      let i = 0;
      while (i < historyMessages.length) {
        if (historyMessages[i].sender === 'ai') {
          // Message d'accueil ou réponse IA isolée
          grouped.push(historyMessages[i]);
          i++;
        } else if (historyMessages[i].sender === 'user') {
          // Ajoute la question
          grouped.push(historyMessages[i]);
          // Cherche la prochaine réponse IA après la question
          let j = i + 1;
          while (j < historyMessages.length && historyMessages[j].sender !== 'ai') {
            j++;
          }
          if (j < historyMessages.length && historyMessages[j].sender === 'ai') {
            grouped.push(historyMessages[j]);
            i = j + 1;
          } else {
            i++;
          }
        } else {
          i++;
        }
      }

      // Ajoute le message d'accueil en haut si le tout premier message n'est pas de l'IA
      let allMessages = grouped;
      if (!grouped.length || grouped[0].sender !== 'ai') {
        allMessages = [
          {
            id: '1',
            text: getWelcomeMessage(),
            sender: 'ai',
            timestamp: new Date()
          },
          ...grouped
        ];
      }
      setMessages(allMessages);
    };
    fetchHistory();
     
  }, [user, getWelcomeMessage, getOnboardingWelcomeQuestion]);

  const handleSearch = async (query: string, type: 'destinations' | 'packages' | 'activities') => {
    try {
      const { data, error } = await supabase.functions.invoke('travel-concierge', {
        body: {
          message: '',
          action: {
            type: `search_${type}`,
            query: query
          }
        }
      });

      if (error) throw error;

      const newMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        sender: 'ai',
        timestamp: new Date(),
        data: { type: 'search_results', results: data.results, category: type }
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erreur lors de la recherche');
    }
  };

  const handleBooking = (item: SearchResult) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: `Parfait ! Vous souhaitez réserver "${item.title}". Pour finaliser votre réservation, je vais avoir besoin de quelques informations : dates souhaitées, nombre de personnes, et vos coordonnées. Pouvez-vous me donner ces détails ?`,
      sender: 'ai',
      timestamp: new Date(),
      data: { type: 'booking_started', item }
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputMessage(''); // Only clear if not a quick reply
    setIsLoading(true);

    // Enregistrer le message utilisateur dans l'historique
    if (user) {
      await supabase.from('chat_history').insert({
        user_id: user.id,
        sender: 'user',
        message: textToSend,
      });
    }

    try {
      const { data, error } = await supabase.functions.invoke('travel-concierge', {
        body: {
          message: textToSend,
          type: 'conversation',
          language: language,
          user_id: user?.id
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
        data: data.next_question ? { type: 'quick_replies', question: data.next_question } : undefined
      };

      setMessages(prev => [...prev, aiMessage]);

      // Enregistrer le message IA dans l'historique
      if (user) {
        await supabase.from('chat_history').insert({
          user_id: user.id,
          sender: 'ai',
          message: data.response,
        });
      }

      // Si l'onboarding est complet, afficher les résultats
      if (data.is_complete && data.results) {
        const resultsMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: 'Voici vos options personnalisées :',
          sender: 'ai',
          timestamp: new Date(),
          data: { type: 'search_results', results: data.results, category: 'recommendations' }
        };
        setMessages(prev => [...prev, resultsMessage]);
        
        // Enable archiving and store conversation data
        setCanArchive(true);
        setCurrentConversationData({
          slots: data.slots,
          results: data.results,
          preferences: data.slots
        });
      }

      // Si l'IA suggère une recherche, on peut l'automatiser
      if (data.suggestedActions?.includes('search') && !data.is_complete) {
        const searchTerms = ['destination', 'voyage', 'activité'];
        const foundTerm = searchTerms.find(term => 
          textToSend.toLowerCase().includes(term)
        );
        
        if (foundTerm) {
          setTimeout(() => {
            if (foundTerm === 'destination') {
              handleSearch(textToSend, 'destinations');
            } else if (foundTerm === 'voyage') {
              handleSearch(textToSend, 'packages');
            } else if (foundTerm === 'activité') {
              handleSearch(textToSend, 'activities');
            }
          }, 1000);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'en' 
          ? 'Sorry, I encountered a problem. Could you please rephrase your request?'
          : 'Désolé, j\'ai rencontré un problème. Pouvez-vous reformuler votre demande ?',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSearchResults = (results: SearchResult[]) => {
    return (
      <div className="grid gap-3 mt-3">
        {results.map((item) => (
          <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{item.title}</h4>
                {item.country && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.country}
                  </p>
                )}
                {item.duration_days && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.duration_days} jours
                  </p>
                )}
                <p className="text-sm font-semibold text-primary mt-1">
                  À partir de {item.price || item.price_from}€
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleBooking(item)}
                className="ml-2"
              >
                Réserver
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderQuickReplies = (question: OnboardingQuestion) => {
    if (!question.quick_replies || question.quick_replies.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs text-muted-foreground mb-2">
          {language === 'en' ? 'Quick options:' : 'Choix rapides :'}
        </p>
        <div className="grid grid-cols-1 gap-2">
          {question.quick_replies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => sendMessage(reply.label)}
              className="text-left justify-start h-auto p-3 hover:bg-blue-50"
            >
              <div>
                <div className="font-medium">{reply.label}</div>
                {reply.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {reply.description}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
        <div className="border-t pt-2 mt-3">
          <p className="text-xs text-muted-foreground">
            {language === 'en' ? 'Or type your own answer below' : 'Ou tapez votre réponse ci-dessous'}
          </p>
        </div>
      </div>
    );
  };

  const resetConversation = async () => {
    if (!user) return;
    
    try {
      // Clear chat history from database
      await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);
      
      // Reset local state
      setMessages([
        {
          id: '1',
          text: getWelcomeMessage(),
          sender: 'ai',
          timestamp: new Date(),
          data: { type: 'quick_replies', question: getOnboardingWelcomeQuestion() }
        }
      ]);
      setCanArchive(false);
      setCurrentConversationData(null);
      
      toast.success(language === 'fr' ? 'Conversation réinitialisée' : 'Conversation reset');
    } catch (error) {
      console.error('Error resetting conversation:', error);
      toast.error(language === 'fr' ? 'Erreur lors de la réinitialisation' : 'Reset failed');
    }
  };

  const archiveConversation = async () => {
    if (!user || !canArchive || !currentConversationData) return;
    
    try {
      const preferences = currentConversationData.slots || {};
      const results = currentConversationData.results || [];
      
      // Generate automatic title
      const tripType = preferences.trip_type as string || 'voyage';
      const destinations = results.length > 0 ? results[0].title : '';
      const dates = preferences.dates as { from?: string } || {};
      
      let title = `${tripType.charAt(0).toUpperCase() + tripType.slice(1)}`;
      if (destinations) title += ` - ${destinations}`;
      if (dates.from) {
        const date = new Date(dates.from);
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        title += ` - ${monthYear}`;
      }
      
      // Archive the conversation  
      const archiveData = {
        user_id: user.id,
        title,
        trip_type: preferences.trip_type as string || null,
        destination_summary: results.map(r => r.title).join(', ') || null,
        total_budget: preferences.budget_total as number || null,
        duration_days: preferences.duration_days as number || null,
        trip_dates: preferences.dates || null,
        preferences: JSON.stringify(preferences),
        messages: JSON.stringify(messages),
        final_recommendations: JSON.stringify(results),
        booking_status: 'planned' as const,
        tags: [
          preferences.trip_type as string,
          ...(preferences.interests as string[] || [])
        ].filter(Boolean)
      };

      const { error } = await supabase
        .from('archived_conversations')
        .insert(archiveData);
      
      if (error) throw error;
      
      toast.success(language === 'fr' ? `Voyage "${title}" archivé avec succès` : `Trip "${title}" archived successfully`);
      
      // Reset for new conversation
      resetConversation();
      
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast.error(language === 'fr' ? 'Erreur lors de l\'archivage' : 'Archive failed');
    }
  };

  const viewTripHistory = () => {
    // Navigate to trip history page
    window.location.href = '/mes-voyages';
  };

  // Mode inline : chat intégré dans la section hero
  if (inline) {
    return (
      <div className="w-full space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
        {/* Messages Container */}
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}>
              <div className={`w-full p-5 rounded-3xl backdrop-blur-md border shadow-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white border-blue-400/30'
                  : 'bg-white/90 text-gray-800 border-white/40'
              }`}>
                <div
                  className="text-base leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: message.text
                      // Gras, italique, titres
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                      .replace(/###\s+(.*?)$/gm, '<h3 class="font-bold text-lg mt-3 mb-2">$1</h3>')
                      .replace(/##\s+(.*?)$/gm, '<h2 class="font-bold text-xl mt-4 mb-2">$1</h2>')
                      // Liens cliquables (version finale sans escapes inutiles)
                      .replace(/(https?:\/\/[\w\-._~:/?#@!$&'()*+,;=%]+)(?![^<]*>)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline break-all">$1</a>')
                      // Paragraphes
                      .replace(/\n\n/g, '</p><p class="mt-3">')
                      .replace(/^/, '<p>')
                      .replace(/$/, '</p>')
                  }}
                />
                {message.data?.type === 'search_results' && message.data.results?.length > 0 && (
                  renderSearchResults(message.data.results)
                )}
                {message.data?.type === 'quick_replies' && (
                  renderQuickReplies(message.data.question)
                )}
                <p className={`text-xs mt-3 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/90 p-5 rounded-3xl shadow-2xl border border-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3 text-gray-600">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'AI is thinking...' : 'L\'IA réfléchit...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Show when user is logged in */}
        {user && (
          <div className="flex gap-2 justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={viewTripHistory}
              className="flex items-center gap-2 bg-white/90 border border-gray-200 hover:bg-gray-50"
            >
              <History className="h-4 w-4" />
              {language === 'fr' ? 'Mes voyages' : 'My trips'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetConversation}
              className="flex items-center gap-2 bg-white/90 border border-gray-200 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              {language === 'fr' ? 'Nouveau voyage' : 'New trip'}
            </Button>
            
            {canArchive && (
              <Button
                variant="outline"
                size="sm"
                onClick={archiveConversation}
                className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
              >
                <Archive className="h-4 w-4" />
                {language === 'fr' ? 'Sauvegarder' : 'Save trip'}
              </Button>
            )}
          </div>
        )}

        {/* Input field - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 p-5">
          <div className="flex gap-4 items-center">
            <Input
              placeholder={
                language === 'en' 
                  ? "Ask about your next destination... ✈️"
                  : "Demandez-moi votre prochaine destination... ✈️"
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isLoading}
              className="flex-1 text-gray-900 placeholder:text-gray-500 border-gray-200 rounded-2xl h-12 text-base bg-white/80 border-2 focus:border-blue-400 focus:bg-white transition-all"
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl px-6 h-12 shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Pas de mode popup flottant
  return null;
};

export default ConversationalAI;