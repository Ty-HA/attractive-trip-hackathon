import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Send, Loader2, MapPin, Calendar as CalendarIcon, RotateCcw, Archive, History, Users, Euro, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useDisplayName } from '@/hooks/useDisplayName';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

// Type for SpeechRecognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

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

  // Voice recognition states
  const [isVoiceChatEnabled, setIsVoiceChatEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const lastProcessedTranscriptRef = useRef<string>('');
  const lastProcessedTimeRef = useRef<number>(0);
  const lastMessageHashRef = useRef<string>('');
  const isListeningRef = useRef<boolean>(false);
  const isVoiceChatEnabledRef = useRef<boolean>(false);

  // Update refs when state changes
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isVoiceChatEnabledRef.current = isVoiceChatEnabled;
  }, [isVoiceChatEnabled]);

  // Force form to always be visible
  useEffect(() => {
    setShowQuickInputs(true);
  }, []);

  const getWelcomeMessage = React.useCallback(() => {
    if (language === 'fr') {
      return `Bonjour${displayName ? ' ' + displayName : ''} ! 🌍✈️\n\nJe suis votre assistant de voyage intelligent. Je vais vous aider à planifier le voyage parfait adapté à vos envies et votre budget.\n\nUtilisez le formulaire ci-dessous pour me donner vos préférences, ou écrivez-moi directement votre projet de voyage !`;
    } else {
      return `Hello${displayName ? ' ' + displayName : ''}! 🌍✈️\n\nI'm your intelligent travel assistant. I'll help you plan the perfect trip tailored to your desires and budget.\n\nUse the form below to share your preferences, or write to me directly about your travel project!`;
    }
  }, [language, displayName]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canArchive, setCanArchive] = useState(false); // True when onboarding is complete
  const [currentConversationData, setCurrentConversationData] = useState<{
    slots?: Record<string, unknown>;
    results?: SearchResult[];
    preferences?: Record<string, unknown>;
  } | null>(null);
  
  // Quick onboarding states  
  const [showQuickInputs, setShowQuickInputs] = useState(true); // Always show form
  const [quickDestination, setQuickDestination] = useState('');
  const [quickBudget, setQuickBudget] = useState(0);
  const [quickPeople, setQuickPeople] = useState('');
  const [quickDateFrom, setQuickDateFrom] = useState<Date | undefined>(undefined);
  const [quickDateTo, setQuickDateTo] = useState<Date | undefined>(undefined);

  // Debug: Log quickDestination changes
  useEffect(() => {
    console.log('🔄 quickDestination state changed to:', quickDestination);
  }, [quickDestination]);

  // Generate unique ID for messages
  let messageCounter = 0;
  const generateUniqueId = () => {
    messageCounter++;
    return `${Date.now()}-${messageCounter}`;
  };

  // Utility function to generate simple hash
  const generateMessageHash = useCallback((text: string) => {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  }, []);

  // Check if message is duplicate
  const isDuplicateMessage = useCallback((text: string) => {
    const hash = generateMessageHash(text);
    const now = Date.now();
    
    // Consider duplicate if same hash within 10 seconds
    if (lastMessageHashRef.current === hash && 
        lastProcessedTimeRef.current && 
        (now - lastProcessedTimeRef.current) < 10000) {
      console.log('🚫 Duplicate message detected:', text);
      return true;
    }
    
    lastMessageHashRef.current = hash;
    lastProcessedTimeRef.current = now;
    return false;
  }, [generateMessageHash]);

  // sendMessage function - defined before processTranscript to avoid initialization issues
  const sendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateUniqueId(),
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
      // Debug: Log current form values
      console.log('🔍 Current form values at sendMessage:', {
        quickDestination,
        quickBudget,
        quickPeople,
        quickDateFrom: quickDateFrom?.toLocaleDateString('fr-FR'),
        quickDateTo: quickDateTo?.toLocaleDateString('fr-FR')
      });

      // Build context from form data
      const formContext = [];
      if (quickDestination) formContext.push(`Destination confirmée: ${quickDestination}`);
      if (quickBudget) formContext.push(`Budget confirmé: ${quickBudget}€`);
      if (quickPeople) formContext.push(`Nombre de personnes confirmé: ${quickPeople}`);
      if (quickDateFrom) formContext.push(`Date de départ confirmée: ${quickDateFrom.toLocaleDateString('fr-FR')}`);
      if (quickDateTo) formContext.push(`Date de retour confirmée: ${quickDateTo.toLocaleDateString('fr-FR')}`);
      
      console.log('📋 Form context being sent:', formContext);
      
      let contextualMessage;
      if (formContext.length > 0) {
        contextualMessage = `INFORMATIONS DÉJÀ COLLECTÉES DANS LE FORMULAIRE: ${formContext.join(', ')}. 
        
IMPORTANT: L'utilisateur a déjà rempli ces informations, ne les redemandez pas. Utilisez ces données pour faire des recommandations concrètes.
        
MESSAGE UTILISATEUR: ${textToSend}`;
      } else {
        contextualMessage = textToSend;
      }

      console.log('📤 Final message sent to AI:', contextualMessage);

      const { data, error } = await supabase.functions.invoke('travel-concierge', {
        body: {
          message: contextualMessage,
          type: 'conversation',
          language: language,
          user_id: user?.id
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: generateUniqueId(),
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

      // Speak the AI response if voice chat is enabled
      if (isVoiceChatEnabled && !isSpeaking) {
        // Clean the text for speech - remove emoji descriptions and formatting
        const cleanText = data.response
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/###\s+(.*?)$/gm, '$1')
          .replace(/##\s+(.*?)$/gm, '$1')
          .replace(/https?:\/\/[\w\-._~:/?#@!$&'()*+,;=%]+/g, 'lien')
          // Remove ALL emoji characters
          .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
          // Remove emoji descriptions in multiple languages
          .replace(/smiling face.*?eyes|visage souriant.*?yeux|rosy cheeks|joues roses/gi, '')
          .replace(/earth globe|airplane|money|people|calendar/gi, '')
          .replace(/globe terrestre|avion|argent|personnes|calendrier/gi, '')
          // Remove common emoji descriptions
          .replace(/face with.*?eyes|visage avec.*?yeux/gi, '')
          .replace(/\bemoji\b.*?\s/gi, '')
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, '. ')
          .trim();
        
        speakText(cleanText);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMessage, isLoading, user, language, isVoiceChatEnabled, isSpeaking]);

  // Function to process transcript (extracted for reuse)
  const processTranscript = useCallback((transcript: string) => {
    console.log('🔄 Processing voice input:', transcript);
    
    // Extract form data from transcript
    const extractedData = extractFormDataFromText(transcript);
    console.log('📊 Extracted data from "' + transcript + '":', extractedData);
    
    // Update form fields if data was extracted
    if (extractedData.destination) {
      console.log('🎯 Before setQuickDestination, current value:', quickDestination);
      setQuickDestination(extractedData.destination);
      console.log('🎯 Updated destination:', extractedData.destination);
      
      // Force a re-render to ensure the UI updates
      setTimeout(() => {
        console.log('🔍 Verifying destination update:', extractedData.destination);
        // Force update by triggering a state change
        setQuickDestination(prev => {
          console.log('📝 Force updating destination from', prev, 'to', extractedData.destination);
          return extractedData.destination || prev;
        });
      }, 50);
    }
    if (extractedData.budget) {
      setQuickBudget(extractedData.budget);
      console.log('💰 Updated budget:', extractedData.budget);
    }
    if (extractedData.people) {
      setQuickPeople(extractedData.people);
      console.log('👥 Updated people:', extractedData.people);
    }
    if (extractedData.dates?.from) {
      setQuickDateFrom(extractedData.dates.from);
      console.log('📅 Updated date from:', extractedData.dates.from);
    }
    if (extractedData.dates?.to) {
      setQuickDateTo(extractedData.dates.to);
      console.log('📅 Updated date to:', extractedData.dates.to);
    }
    
    // Send message to AI if form data was extracted successfully or if voice chat is enabled
    console.log('📤 Auto-sending transcript to AI after form extraction:', transcript);
    sendMessage(transcript);
  }, [quickDestination, sendMessage]);

  // Text-to-speech function
  const speakText = useCallback((text: string) => {
    if (!isVoiceChatEnabled || isSpeaking) return;
    
    // Stop speech recognition while AI is speaking to prevent feedback loop
    if (recognitionRef.current && isListening) {
      console.log('🛑 Stopping speech recognition while AI speaks');
      recognitionRef.current.stop();
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      console.log('🗣️ AI started speaking, recognition stopped');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('✅ AI finished speaking, NOT restarting recognition automatically');
      setIsSpeaking(false);
      
      // Don't automatically restart recognition - user needs to manually click microphone
      // This prevents the AI from continuously listening and creating feedback loops
    };
    
    utterance.onerror = () => {
      console.log('❌ AI speech error, NOT restarting recognition');
      setIsSpeaking(false);
      
      // Don't automatically restart on error either
    };
    
    window.speechSynthesis.speak(utterance);
  }, [isVoiceChatEnabled, isSpeaking, language, isListening]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('SpeechRecognition API available');
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true; // Keep continuous to capture full speech
      recognitionInstance.interimResults = true;
      recognitionInstance.maxAlternatives = 1;
      recognitionInstance.lang = language === 'fr' ? 'fr-FR' : 'en-US'; // Use language context
      
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started in', language === 'fr' ? 'French' : 'English');
        setIsListening(true);
        finalTranscriptRef.current = ''; // Clear previous transcript
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        console.log('finalTranscriptRef.current at onend:', finalTranscriptRef.current);
        setIsListening(false);
        
        // Clear timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }
        
        // Send the final transcript if we have one
        const transcript = finalTranscriptRef.current.trim();
        console.log('Transcript to process:', transcript);
        if (transcript) {
          console.log('✅ Final transcript to process:', transcript);
          
          // Avoid processing the same transcript twice only if it's very recent (within 2 seconds)
          if (isDuplicateMessage(transcript)) {
            return;
          }
          
          // Filter out AI-generated text that might be picked up by microphone
          const aiPhrases = [
            'visage souriant',
            'yeux rieurs', 
            'joues roses',
            'pour continuer à vous aider',
            'quel est votre budget',
            'vous serez donc',
            'smiling face',
            'rosy cheeks',
            'parfait vous',
            'awesome paris',
            'great choice',
            'je confirme que',
            'pourriez-vous',
            'me préciser',
            'bien ajuster'
          ];
          
          const isAIContent = aiPhrases.some(phrase => 
            transcript.toLowerCase().includes(phrase)
          );
          
          if (isAIContent) {
            console.log('🚫 Ignoring AI-generated content in onend:', transcript);
            return;
          }
          
          // Clear transcript after getting it
          finalTranscriptRef.current = '';
          
          // Process the voice input using the shared function
          console.log('🔄 Processing voice input in onend:', transcript);
          processTranscript(transcript);
        } else {
          console.log('No final transcript to process');
        }
      };
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          // Only log final results to reduce console noise
          if (event.results[i].isFinal) {
            console.log(`Final result: "${transcript}"`);
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Show interim results occasionally
        if (interimTranscript && Math.random() < 0.05) { // 5% chance to reduce spam
          // Filter out AI content from interim results too
          const aiPhrases = [
            'je confirme que',
            'pour que je puisse',
            'pourriez-vous',
            'me préciser',
            'bien ajuster',
            'suggestions',
            'budget de',
            'correspond',
            'ensemble du séjour'
          ];
          
          const isAIContent = aiPhrases.some(phrase => 
            interimTranscript.toLowerCase().includes(phrase)
          );
          
          if (!isAIContent) {
            console.log('Interim transcript:', interimTranscript);
          }
        }
        
        // Process final transcript immediately
        if (finalTranscript) {
          console.log('🎯 Processing final transcript immediately:', finalTranscript);
          
          // Avoid processing duplicate messages
          if (isDuplicateMessage(finalTranscript)) {
            return;
          }
          
          // Filter out AI-generated text that might be picked up by microphone
          const aiPhrases = [
            'visage souriant',
            'yeux rieurs',
            'joues roses',
            'pour continuer à vous aider',
            'quel est votre budget',
            'vous serez donc',
            'smiling face',
            'rosy cheeks',
            'parfait vous',
            'awesome paris',
            'great choice',
            'je confirme que',
            'pourriez-vous',
            'me préciser',
            'bien ajuster'
          ];
          
          const isAIContent = aiPhrases.some(phrase => 
            finalTranscript.toLowerCase().includes(phrase)
          );
          
          if (isAIContent) {
            console.log('🚫 Ignoring AI-generated content picked up by microphone:', finalTranscript);
            return;
          }
          
          // Store for onend as backup
          finalTranscriptRef.current = finalTranscript;
          
          // Process immediately
          processTranscript(finalTranscript);
          
          // Set a timeout to stop listening after 1.5 seconds of silence
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
          }
          
          speechTimeoutRef.current = setTimeout(() => {
            if (recognitionInstance && isListeningRef.current) {
              console.log('Stopping recognition due to timeout - user finished speaking');
              recognitionInstance.stop();
            }
          }, 2000); // Reduced to 2 seconds - stop listening faster when user stops talking
        }
      };
      
      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        setIsListening(false);
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast.error(language === 'fr' 
            ? 'Permission microphone refusée. Veuillez autoriser l\'accès au microphone.'
            : 'Microphone permission denied. Please allow microphone access.'
          );
        } else if (event.error === 'no-speech') {
          toast.error(language === 'fr' 
            ? 'Aucun son détecté. Essayez de parler plus fort.'
            : 'No speech detected. Try speaking louder.'
          );
        } else {
          toast.error(language === 'fr' 
            ? `Erreur de reconnaissance vocale: ${event.error}`
            : `Speech recognition error: ${event.error}`
          );
        }
      };
      
      recognitionRef.current = recognitionInstance;
    } else {
      console.log('SpeechRecognition API not available');
    }
    
    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [language, processTranscript, quickDestination, sendMessage, isDuplicateMessage]);

  // Process voice input intelligently
  // Extract form data from natural language text
  const extractFormDataFromText = (text: string): {
    destination?: string;
    budget?: number;
    people?: string;
    dates?: { from?: Date; to?: Date };
  } => {
    console.log('🔍 Extracting data from text:', text);
    const lowerText = text.toLowerCase();
    const extracted: {
      destination?: string;
      budget?: number;
      people?: string;
      dates?: { from?: Date; to?: Date };
    } = {};
    
    // Extract destination (look for "to", "à", "en", etc.)
    const destinationPatterns = [
      /(?:aller|voyager|partir|voyage)\s+(?:à|en|au|aux|vers|dans)\s+([a-zàâäéèêëïîôöùûüÿ\s-]+?)(?:\s+(?:du|le|pour|et|$)|,|\.|!|\?)/i,
      /(?:je veux aller|je vais|on va|nous allons|destination)\s+(?:à|en|au|aux|vers|dans)?\s*([a-zàâäéèêëïîôöùûüÿ\s-]+?)(?:\s+(?:du|le|pour|et|est|$)|,|\.|!|\?)/i,
      /(?:i want to go|want to go|going|trip to)\s+(?:to)?\s*([a-zàâäéèêëïîôöùûüÿ\s-]+?)(?:\s+(?:from|for|is|$)|,|\.|!|\?)/i,
      /(?:destination|dest)\s*:?\s*([a-zàâäéèêëïîôöùûüÿ\s-]+?)(?:\s+(?:du|le|pour|et|est|$)|,|\.|!|\?)/i,
      // Comprehensive city list including French cities
      /(tokyo|paris|londres|london|bali|new york|rome|madrid|berlin|barcelone|barcelona|amsterdam|prague|vienne|vienna|budapest|lisbonne|lisbon|dublin|édimbourg|edinburgh|stockholm|copenhague|copenhagen|oslo|helsinki|reykjavik|zurich|genève|geneva|milan|florence|venise|venice|naples|athènes|athens|santorin|santorini|mykonos|istanbul|le caire|cairo|marrakech|casablanca|dubaï|dubai|mumbai|delhi|bangkok|singapour|singapore|hong kong|séoul|seoul|sydney|melbourne|toronto|vancouver|montréal|montreal|chicago|miami|las vegas|mexico|buenos aires|rio|lima|santiago|bogota|caracas|havane|havana|nassau|kingston|san juan|bordeaux|lyon|marseille|toulouse|nice|nantes|strasbourg|montpellier|lille|rennes|reims|saint-étienne|toulon|grenoble|dijon|angers|nîmes|villeurbanne|cannes|antibes|avignon|saint-malo|brest|quimper|vannes|lorient|saint-nazaire|la baule|dinard|deauville|honfleur|rouen|caen|le havre|amiens|calais|dunkerque)/i
    ];
    
    for (const pattern of destinationPatterns) {
      const match = text.match(pattern);
      if (match) {
        let destination = match[1]?.trim() || match[0]?.trim();
        // Clean up common artifacts
        destination = destination.replace(/^(à|en|au|aux|vers|dans|to)\s+/i, '');
        destination = destination.replace(/\s+(et|and|ou|or).*$/i, '');
        extracted.destination = destination;
        console.log('✅ Extracted destination:', destination);
        break;
      }
    }
    
    // Extract budget (look for numbers with currency)
    const budgetPatterns = [
      /(\d+)\s*(?:euros?|€|dollars?|\$)/i,
      /budget.*?(\d+)/i,
      /(\d+).*?budget/i
    ];
    
    for (const pattern of budgetPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseInt(match[1]);
        if (amount > 50 && amount < 50000) {
          extracted.budget = amount;
        }
        break;
      }
    }
    
    // Extract number of people
    const peoplePatterns = [
      /(?:je pars|je voyage|je vais)\s*(?:seul|seule)/i, // "je pars seul/seule"
      /(?:seul|seule|tout seul|toute seule)/i, // "seul", "seule", etc.
      /(?:nous serons|on sera|on est)\s*(?:deux|2)/i, // "nous serons deux"
      /(?:nous serons|on sera|on est)\s*(?:trois|3)/i, // "nous serons trois"
      /(?:nous serons|on sera|on est)\s*(?:quatre|4)/i, // "nous serons quatre"
      /(?:une|1)\s*personne/i,  // "une personne" or "1 personne"
      /(?:deux|2)\s*personnes/i, // "deux personnes" or "2 personnes"
      /(?:trois|3)\s*personnes/i, // "trois personnes" or "3 personnes"
      /(?:quatre|4)\s*personnes/i, // "quatre personnes" or "4 personnes"
      /(\d+)\s*(?:person|people|personne|personnes)/i,
      /(?:for|pour)\s*(\d+)/i,
      /(\d+)\s*(?:of us|d'entre nous|nous)/i
    ];
    
    for (let i = 0; i < peoplePatterns.length; i++) {
      const match = text.match(peoplePatterns[i]);
      if (match) {
        let num;
        if (i <= 8) { // Word-based patterns
          if (i === 0 || i === 1) num = 1; // "je pars seul" or "seul"
          else if (i === 2) num = 2; // "nous serons deux"
          else if (i === 3) num = 3; // "nous serons trois"
          else if (i === 4) num = 4; // "nous serons quatre"
          else if (i === 5) num = 1; // "une personne"
          else if (i === 6) num = 2; // "deux personnes"
          else if (i === 7) num = 3; // "trois personnes"
          else if (i === 8) num = 4; // "quatre personnes"
        } else {
          num = parseInt(match[1]); // Number-based patterns
        }
        
        if (num > 0 && num <= 20) {
          extracted.people = num.toString();
          console.log('👥 Extracted people count:', num, 'from pattern', i);
        }
        break;
      }
    }
    
    // Extract dates
    const datePatterns = [
      // English "from X to Y" patterns
      /(?:from|starting)\s*(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|until)\s*(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{1,2})(?:st|nd|rd|th)?/i,
      // French "du X au Y same month" - NEW PATTERN for "du 5 au 10 septembre"
      /(?:du|à partir du)\s*(\d{1,2})\s*(?:er|ème)?\s*(?:au|jusqu'au)\s*(\d{1,2})\s*(?:er|ème)?\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i,
      // French "du X month au Y month" - FULL PATTERN for different months
      /(?:du|à partir du)\s*(\d{1,2})\s*(?:er|ème)?\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(?:au|jusqu'au)\s*(\d{1,2})\s*(?:er|ème)?\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i,
      // Numeric patterns
      /(?:from|du)\s*(\d{1,2})\/(\d{1,2})\s*(?:to|au)\s*(\d{1,2})\/(\d{1,2})/i,
      // Simple date mentions - moved to end to avoid conflicts
      /(?:le\s+)?(\d{1,2})\s*(?:er|ème)?\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)(?!\s*(?:au|jusqu|to))/i
    ];
    
    const monthMap: Record<string, number> = {
      'january': 0, 'janvier': 0,
      'february': 1, 'février': 1,
      'march': 2, 'mars': 2,
      'april': 3, 'avril': 3,
      'may': 4, 'mai': 4,
      'june': 5, 'juin': 5,
      'july': 6, 'juillet': 6,
      'august': 7, 'août': 7,
      'september': 8, 'septembre': 8,
      'october': 9, 'octobre': 9,
      'november': 10, 'novembre': 10,
      'december': 11, 'décembre': 11
    };
    
    for (let i = 0; i < datePatterns.length; i++) {
      const pattern = datePatterns[i];
      const match = text.match(pattern);
      if (match) {
        console.log('📅 Date match found for pattern', i, ':', match);
        
        if (i === 0) {
          // English "from month day to month day"
          const fromMonth = monthMap[match[1].toLowerCase()];
          const fromDay = parseInt(match[2]);
          const toMonth = monthMap[match[3].toLowerCase()];
          const toDay = parseInt(match[4]);
          
          if (fromMonth !== undefined && toMonth !== undefined) {
            const currentYear = new Date().getFullYear();
            extracted.dates = {
              from: new Date(currentYear, fromMonth, fromDay),
              to: new Date(currentYear, toMonth, toDay)
            };
            console.log('✅ Extracted English dates FROM:', extracted.dates.from, 'TO:', extracted.dates.to);
          }
        } else if (i === 1) {
          // French "du day au day month" - SAME MONTH
          const fromDay = parseInt(match[1]);
          const toDay = parseInt(match[2]);
          const month = monthMap[match[3].toLowerCase()];
          
          console.log('🇫🇷 French same-month pattern details:', {
            fromDay, toDay, month,
            match1: match[1], match2: match[2], match3: match[3],
            fullMatch: match[0]
          });
          
          if (month !== undefined) {
            const currentYear = new Date().getFullYear();
            extracted.dates = {
              from: new Date(currentYear, month, fromDay),
              to: new Date(currentYear, month, toDay)
            };
            console.log('✅ Extracted French same-month dates FROM:', extracted.dates.from, 'TO:', extracted.dates.to);
            console.log('✅ Date strings FROM:', extracted.dates.from.toLocaleDateString('fr-FR'), 'TO:', extracted.dates.to.toLocaleDateString('fr-FR'));
          }
        } else if (i === 2) {
          // French "du day month au day month" - DIFFERENT MONTHS
          const fromDay = parseInt(match[1]);
          const fromMonth = monthMap[match[2].toLowerCase()];
          const toDay = parseInt(match[3]);
          const toMonth = monthMap[match[4].toLowerCase()];
          
          console.log('🇫🇷 French different-month pattern details:', {
            fromDay, fromMonth, toDay, toMonth,
            match1: match[1], match2: match[2], match3: match[3], match4: match[4],
            fullMatch: match[0]
          });
          
          if (fromMonth !== undefined && toMonth !== undefined) {
            const currentYear = new Date().getFullYear();
            extracted.dates = {
              from: new Date(currentYear, fromMonth, fromDay),
              to: new Date(currentYear, toMonth, toDay)
            };
            console.log('✅ Extracted French different-month dates FROM:', extracted.dates.from, 'TO:', extracted.dates.to);
            console.log('✅ Date strings FROM:', extracted.dates.from.toLocaleDateString('fr-FR'), 'TO:', extracted.dates.to.toLocaleDateString('fr-FR'));
          }
        } else if (i === 3) {
          // Numeric "day/month to day/month"
          const fromDay = parseInt(match[1]);
          const fromMonth = parseInt(match[2]) - 1; // JS months are 0-based
          const toDay = parseInt(match[3]);
          const toMonth = parseInt(match[4]) - 1;
          
          const currentYear = new Date().getFullYear();
          extracted.dates = {
            from: new Date(currentYear, fromMonth, fromDay),
            to: new Date(currentYear, toMonth, toDay)
          };
          console.log('✅ Extracted numeric dates FROM:', extracted.dates.from, 'TO:', extracted.dates.to);
        } else if (i === 4) {
          // Single date
          const day = parseInt(match[1]);
          const month = monthMap[match[2].toLowerCase()];
          
          if (month !== undefined) {
            const currentYear = new Date().getFullYear();
            extracted.dates = {
              from: new Date(currentYear, month, day)
            };
            console.log('✅ Extracted single date:', extracted.dates.from);
          }
        }
        break;
      }
    }
    
    return extracted;
  };

  // Ask follow-up questions to complete the form
  const askFollowUpQuestion = useCallback((field: string) => {
    let question = '';
    
    switch (field) {
      case 'destination':
        question = language === 'fr' 
          ? 'Où souhaitez-vous voyager ? Quelle destination vous fait rêver ?'
          : 'Where would you like to travel? What destination interests you?';
        break;
      case 'budget':
        question = language === 'fr'
          ? 'Quel est votre budget approximatif pour ce voyage ?'
          : 'What is your approximate budget for this trip?';
        break;
      case 'people':
        question = language === 'fr'
          ? 'Combien de personnes voyageront avec vous ?'
          : 'How many people will be traveling with you?';
        break;
    }
    
    if (question) {
      const aiMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        text: question,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the question if voice chat is enabled
      if (isVoiceChatEnabled) {
        speakText(question);
      }
    }
  }, [language, isVoiceChatEnabled, speakText]);

  // Toggle voice chat mode
  const toggleVoiceChat = () => {
    setIsVoiceChatEnabled(!isVoiceChatEnabled);
    
    if (!isVoiceChatEnabled) {
      // Turning ON - just enable voice mode, don't auto-speak
      toast.success(language === 'fr' ? 'Mode vocal activé - Cliquez sur le micro pour parler' : 'Voice mode enabled - Click microphone to speak');
      
    } else {
      // Turning OFF
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
      }
      toast.success(language === 'fr' ? 'Mode vocal désactivé' : 'Voice mode disabled');
    }
  };

  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error(language === 'fr' 
        ? 'Reconnaissance vocale non disponible sur ce navigateur'
        : 'Speech recognition not available on this browser'
      );
      return;
    }
    
    if (isListening) {
      // Stop listening
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      recognitionRef.current.stop();
      setIsListening(false);
      finalTranscriptRef.current = '';
    } else {
      // Start listening
      finalTranscriptRef.current = '';
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error(language === 'fr' 
          ? 'Erreur lors du démarrage de la reconnaissance vocale'
          : 'Error starting speech recognition'
        );
      }
    }
  };

  // Récupérer l'historique du chat à l'initialisation
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        // Pas connecté : pas de messages initiaux
        setMessages([]);
        return;
      }
      // Récupère l'historique depuis Supabase
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: true });
      if (error || !data) {
        // En cas d'erreur, pas de messages
        setMessages([]);
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

      // Utilise directement l'historique groupé
      setMessages(grouped);
      
      // Always keep quick inputs visible - don't hide based on history
      // if (grouped.length > 0) {
      //   setShowQuickInputs(false);
      // }
    };
    fetchHistory();
     
  }, [user, getWelcomeMessage]);

  const handleSearch = useCallback(async (query: string, type: 'destinations' | 'packages' | 'activities') => {
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
  }, []);

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
      setMessages([]);
      setCanArchive(false);
      setCurrentConversationData(null);
      
      // Reset voice recognition refs to avoid conflicts
      lastProcessedTranscriptRef.current = '';
      lastMessageHashRef.current = '';
      lastProcessedTimeRef.current = 0;
      finalTranscriptRef.current = '';
      
      // Show quick inputs again
      setShowQuickInputs(true);
      resetQuickInputs();
      
      toast.success(language === 'fr' ? 'Conversation réinitialisée' : 'Conversation reset');
    } catch (error) {
      console.error('Error resetting conversation:', error);
      toast.error(language === 'fr' ? 'Erreur lors de la réinitialisation' : 'Reset failed');
    }
  };

  const archiveConversation = async () => {
    if (!user) return;
    
    // Si pas de messages, ne rien archiver
    if (messages.length === 0) {
      toast.error(language === 'fr' ? 'Aucune conversation à archiver' : 'No conversation to archive');
      return;
    }
    
    try {
      const preferences = currentConversationData?.slots || {};
      const results = currentConversationData?.results || [];
      
      // Generate automatic title from conversation
      let title = language === 'fr' ? 'Conversation voyage' : 'Travel conversation';
      
      // Try to extract destination from first user message
      if (messages.length > 0) {
        const firstUserMessage = messages.find(m => m.sender === 'user');
        if (firstUserMessage) {
          const text = firstUserMessage.text.toLowerCase();
          // Extract potential destination names (simple heuristic)
          const words = text.split(' ');
          const capitalizedWords = words.filter(word => 
            word.length > 3 && /^[A-Z]/.test(firstUserMessage.text.split(' ')[words.indexOf(word)])
          );
          if (capitalizedWords.length > 0) {
            title = `${language === 'fr' ? 'Voyage' : 'Trip'} ${capitalizedWords[0]}`;
          }
        }
      }
      
      // Add current date
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      title += ` - ${dateStr}`;
      
      // Archive the conversation  
      const archiveData = {
        user_id: user.id,
        title,
        trip_type: preferences.trip_type as string || null,
        destination_summary: results.map(r => r.title).join(', ') || null,
        total_budget: preferences.budget_total as number || null,
        duration_days: preferences.duration_days as number || null,
        trip_dates: preferences.dates ? JSON.stringify(preferences.dates) : null,
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
      await resetConversation();
      
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast.error(language === 'fr' ? 'Erreur lors de l\'archivage' : 'Archive failed');
    }
  };

  const viewTripHistory = () => {
    // Navigate to trip history page
    window.location.href = '/mes-voyages';
  };

  // Quick onboarding handlers
  const handleQuickSubmit = () => {
    if (!quickDestination.trim()) {
      toast.error(language === 'fr' ? 'Veuillez saisir une destination' : 'Please enter a destination');
      return;
    }
    
    const fromDate = quickDateFrom ? format(quickDateFrom, 'dd/MM/yyyy', { locale: fr }) : '';
    const toDate = quickDateTo ? format(quickDateTo, 'dd/MM/yyyy', { locale: fr }) : '';
    const dateRange = fromDate && toDate ? `du ${fromDate} au ${toDate}` : fromDate ? `à partir du ${fromDate}` : '';
    
    const quickMessage = language === 'fr' 
      ? `Voyage à ${quickDestination} pour ${quickPeople} personne(s), budget ${quickBudget}€${dateRange ? ', ' + dateRange : ''}`
      : `Trip to ${quickDestination} for ${quickPeople} people, budget €${quickBudget}${dateRange ? ', ' + dateRange : ''}`;
    
    // Don't hide the form - keep it visible for further input
    // setShowQuickInputs(false);
    sendMessage(quickMessage);
  };

  const resetQuickInputs = () => {
    setQuickDestination('');
    setQuickBudget(0);
    setQuickPeople('');
    setQuickDateFrom(undefined);
    setQuickDateTo(undefined);
  };

  // Mode inline : chat intégré dans la section hero
  if (inline) {
    return (
      <div className="w-full space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
        {/* Quick Onboarding Inputs */}
        {showQuickInputs && (
          <Card className="p-6 bg-white/95 backdrop-blur-md border border-white/40 shadow-2xl">
            <div className="space-y-6">
              {/* Welcome message */}
              <div 
                className="text-base leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{
                  __html: getWelcomeMessage()
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                    .replace(/\n\n/g, '</p><p class="mt-3">')
                    .replace(/^/, '<p>')
                    .replace(/$/, '</p>')
                }}
              />
              
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-t pt-4">
                {language === 'fr' ? 'Dites-moi vos envies de voyage' : 'Tell me about your travel plans'}
              </h3>

              {/* Voice Chat Toggle Button */}
              <div className="mb-6 text-center">
                <Button
                  onClick={toggleVoiceChat}
                  className={`px-6 py-3 text-lg font-semibold rounded-2xl transition-all ${
                    isVoiceChatEnabled
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg'
                  }`}
                >
                  {isVoiceChatEnabled ? (
                    <>
                      <Volume2 className="w-5 h-5 mr-2" />
                      {language === 'fr' ? 'IA VOCAL CHAT ON' : 'AI VOICE CHAT ON'}
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-5 h-5 mr-2" />
                      {language === 'fr' ? 'IA VOCAL CHAT OFF' : 'AI VOICE CHAT OFF'}
                    </>
                  )}
                </Button>
                
                {isVoiceChatEnabled && (
                  <div className="mt-3">
                    <p className="text-sm text-green-600 font-medium">
                      {language === 'fr' ? 'Mode conversationnel activé - Parlez-moi naturellement !' : 'Conversational mode enabled - Speak to me naturally!'}
                    </p>
                    
                    {/* Microphone Button */}
                    <Button
                      onClick={toggleListening}
                      className={`mt-3 px-4 py-2 rounded-xl transition-all ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                      disabled={isLoading}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4 mr-2" />
                          {language === 'fr' ? 'Arrêter l\'écoute' : 'Stop listening'}
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          {language === 'fr' ? 'Parler maintenant' : 'Speak now'}
                        </>
                      )}
                    </Button>
                    
                    {/* Voice status indicator */}
                    {(isListening || isSpeaking) && (
                      <div className="mt-2">
                        <div className="flex items-center justify-center gap-2 text-sm">
                          {isListening && (
                            <div className="flex items-center gap-2 text-red-600">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              {language === 'fr' ? 'En écoute...' : 'Listening...'}
                            </div>
                          )}
                          {isSpeaking && (
                            <div className="flex items-center gap-2 text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              {language === 'fr' ? 'IA en train de parler...' : 'AI speaking...'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Destination */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {language === 'fr' ? 'Destination' : 'Destination'}
                </label>
                <Input
                  placeholder={language === 'fr' ? 'Ex: Bali, Paris, Tokyo...' : 'Ex: Bali, Paris, Tokyo...'}
                  value={quickDestination}
                  onChange={(e) => setQuickDestination(e.target.value)}
                  className="bg-white/80"
                />
              </div>

              {/* Budget Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  {language === 'fr' ? 'Budget max' : 'Max budget'}
                </label>
                <Input
                  type="number"
                  placeholder="ex: 1500"
                  value={quickBudget || ''}
                  onChange={(e) => setQuickBudget(parseInt(e.target.value) || 0)}
                  className="bg-white/80"
                  min={0}
                />
              </div>

              {/* Number of People */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {language === 'fr' ? 'Nombre de personnes' : 'Number of people'}
                </label>
                <Select value={quickPeople} onValueChange={setQuickPeople}>
                  <SelectTrigger className="bg-white/80">
                    <SelectValue placeholder={language === 'fr' ? 'Choisir...' : 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 {language === 'fr' ? 'personne' : 'person'}</SelectItem>
                    <SelectItem value="2">2 {language === 'fr' ? 'personnes' : 'people'}</SelectItem>
                    <SelectItem value="3">3 {language === 'fr' ? 'personnes' : 'people'}</SelectItem>
                    <SelectItem value="4">4 {language === 'fr' ? 'personnes' : 'people'}</SelectItem>
                    <SelectItem value="5">5 {language === 'fr' ? 'personnes' : 'people'}</SelectItem>
                    <SelectItem value="6">6+ {language === 'fr' ? 'personnes' : 'people'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {language === 'fr' ? 'Date de départ' : 'From date'}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-white/80 ${
                          !quickDateFrom && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {quickDateFrom ? format(quickDateFrom, "dd/MM/yyyy", { locale: fr }) : 
                          (language === 'fr' ? 'Choisir une date' : 'Pick a date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quickDateFrom}
                        onSelect={setQuickDateFrom}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {language === 'fr' ? 'Date de retour' : 'To date'}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-white/80 ${
                          !quickDateTo && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {quickDateTo ? format(quickDateTo, "dd/MM/yyyy", { locale: fr }) : 
                          (language === 'fr' ? 'Choisir une date' : 'Pick a date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quickDateTo}
                        onSelect={setQuickDateTo}
                        disabled={(date) => date < (quickDateFrom || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleQuickSubmit} className="flex-1">
                  {language === 'fr' ? 'Rechercher' : 'Search'}
                </Button>
                <Button variant="outline" onClick={() => setShowQuickInputs(false)}>
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
              </div>
            </div>
          </Card>
        )}

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
            
            <Button
              variant="outline"
              size="sm"
              onClick={archiveConversation}
              className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
            >
              <Archive className="h-4 w-4" />
              {language === 'fr' ? 'Archiver le trip' : 'Archive trip'}
            </Button>
          </div>
        )}

        {/* Input field - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 p-5">
          <div className="flex gap-4 items-center">
            <Input
              placeholder={
                isListening 
                  ? (language === 'en' ? "Listening... 🎤" : "J'écoute... 🎤")
                  : (language === 'en' 
                      ? "Ask about your next destination... ✈️"
                      : "Demandez-moi votre prochaine destination... ✈️")
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isLoading || isListening}
              className={`flex-1 text-gray-900 placeholder:text-gray-500 border-gray-200 rounded-2xl h-12 text-base bg-white/80 border-2 focus:border-blue-400 focus:bg-white transition-all ${
                isListening ? 'border-red-400 bg-red-50' : ''
              }`}
            />
            
            {/* Microphone Button */}
            <Button
              onClick={toggleListening}
              variant="outline"
              className={`h-12 w-12 rounded-2xl transition-all ${
                isListening
                  ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 animate-pulse'
                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              }`}
              disabled={isLoading}
              title={isListening 
                ? (language === 'fr' ? 'Arrêter l\'écoute' : 'Stop listening')
                : (language === 'fr' ? 'Commencer l\'écoute' : 'Start listening')
              }
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <Button 
              onClick={() => sendMessage()} 
              disabled={!inputMessage.trim() || isLoading || isListening}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl px-6 h-12 shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Voice status indicator for bottom bar */}
          {(isListening || isSpeaking) && (
            <div className="mt-3 text-center">
              <div className="flex items-center justify-center gap-2 text-sm">
                {isListening && (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    {language === 'fr' ? 'En écoute... Parlez maintenant' : 'Listening... Speak now'}
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {language === 'fr' ? 'IA en train de parler...' : 'AI speaking...'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pas de mode popup flottant
  return null;
};

export default ConversationalAI;