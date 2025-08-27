import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Loader2, X, Package, MapPin, Calendar, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useConversationalAI } from '@/contexts/ConversationalAIContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  data?: any;
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

const ConversationalAI = () => {
  const { isOpen, openAI, closeAI } = useConversationalAI();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant de voyage personnel. Je peux vous aider à chercher et réserver des destinations, voyages organisés, activités et restaurants. Que puis-je faire pour vous aujourd\'hui ?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('travel-concierge', {
        body: {
          message: inputMessage,
          type: 'conversation'
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Si l'IA suggère une recherche, on peut l'automatiser
      if (data.suggestedActions?.includes('search')) {
        const searchTerms = ['destination', 'voyage', 'activité'];
        const foundTerm = searchTerms.find(term => 
          inputMessage.toLowerCase().includes(term)
        );
        
        if (foundTerm) {
          setTimeout(() => {
            if (foundTerm === 'destination') {
              handleSearch(inputMessage, 'destinations');
            } else if (foundTerm === 'voyage') {
              handleSearch(inputMessage, 'packages');
            } else if (foundTerm === 'activité') {
              handleSearch(inputMessage, 'activities');
            }
          }, 1000);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, j\'ai rencontré un problème. Pouvez-vous reformuler votre demande ?',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSearchResults = (results: SearchResult[], category: string) => {
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

  const renderMessage = (message: Message) => (
    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] p-3 rounded-lg ${
        message.sender === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-accent text-accent-foreground'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        {message.data?.type === 'search_results' && message.data.results?.length > 0 && (
          renderSearchResults(message.data.results, message.data.category)
        )}
        <p className="text-xs opacity-60 mt-1">
          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <Button
        onClick={openAI}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-luxury bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-8 right-8 w-96 h-[500px] shadow-2xl z-50">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-primary-dark text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">Assistant de Voyage IA</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={closeAI}
          className="text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="p-0 flex flex-col h-[calc(500px-73px)]">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.map(renderMessage)}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-accent text-accent-foreground p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Tapez votre message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!inputMessage.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationalAI;