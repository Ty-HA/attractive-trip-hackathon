import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MessageCircle, MapPin, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TravelConcierge = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('general');
  const [context, setContext] = useState({
    destination: '',
    budget: '',
    duration: '',
    travelers: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('travel-concierge', {
        body: {
          message: message.trim(),
          type,
          context: Object.fromEntries(
            Object.entries(context).filter(([_, value]) => value.trim() !== '')
          )
        }
      });

      if (error) {
        throw error;
      }

      setResponse(data.response);
      toast.success('Réponse reçue !');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération de la réponse');
    } finally {
      setLoading(false);
    }
  };

  const updateContext = (field: keyof typeof context, value: string) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Travel Concierge IA
          </CardTitle>
          <p className="text-muted-foreground">
            Votre assistant de voyage personnel propulsé par DeepSeek AI
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Type de demande</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Question générale</SelectItem>
                  <SelectItem value="itinerary">Créer un itinéraire</SelectItem>
                  <SelectItem value="destination">Info destination</SelectItem>
                  <SelectItem value="booking">Aide à la réservation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destination" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Destination
                </Label>
                <Input
                  id="destination"
                  placeholder="ex: Paris, Tokyo..."
                  value={context.destination}
                  onChange={(e) => updateContext('destination', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="budget" className="flex items-center gap-1">
                  Budget
                </Label>
                <Input
                  id="budget"
                  placeholder="ex: 2000€, budget serré..."
                  value={context.budget}
                  onChange={(e) => updateContext('budget', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="duration" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Durée
                </Label>
                <Input
                  id="duration"
                  placeholder="ex: 1 semaine, 3 jours..."
                  value={context.duration}
                  onChange={(e) => updateContext('duration', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="travelers" className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Voyageurs
                </Label>
                <Input
                  id="travelers"
                  placeholder="ex: 2 adultes, famille..."
                  value={context.travelers}
                  onChange={(e) => updateContext('travelers', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Votre question</Label>
              <Textarea
                id="message"
                placeholder="Posez votre question sur les voyages..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-24"
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={!message.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Génération en cours...
                </>
              ) : (
                'Demander conseil'
              )}
            </Button>
          </div>

          {response && (
            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="text-lg">Réponse du concierge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">
                  {response}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelConcierge;