import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, MailX } from 'lucide-react';

const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<'loading' | 'valid' | 'already' | 'error' | 'success'>('loading');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) { setState('error'); return; }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (data.valid === false && data.reason === 'already_unsubscribed') {
          setState('already');
        } else if (data.valid) {
          setState('valid');
        } else {
          setState('error');
        }
      } catch {
        setState('error');
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const { data } = await supabase.functions.invoke('handle-email-unsubscribe', {
        body: { token },
      });
      if (data?.success) {
        setState('success');
      } else if (data?.reason === 'already_unsubscribed') {
        setState('already');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
    setProcessing(false);
  };

  const content = {
    loading: {
      icon: <Loader2 className="h-10 w-10 animate-spin text-accent" />,
      title: 'Vérification…',
      desc: null,
      action: null,
    },
    valid: {
      icon: <MailX className="h-10 w-10 text-muted-foreground" />,
      title: 'Se désabonner',
      desc: 'Vous ne recevrez plus de courriels de notification de Famille Souvenir.',
      action: (
        <Button onClick={handleUnsubscribe} disabled={processing} className="w-full max-w-xs">
          {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Confirmer le désabonnement
        </Button>
      ),
    },
    already: {
      icon: <CheckCircle className="h-10 w-10 text-accent" />,
      title: 'Déjà désabonné(e)',
      desc: 'Vous êtes déjà désabonné(e) de nos courriels.',
      action: null,
    },
    success: {
      icon: <CheckCircle className="h-10 w-10 text-accent" />,
      title: 'Désabonnement confirmé',
      desc: 'Vous avez bien été désabonné(e). Vous ne recevrez plus de courriels de notification.',
      action: null,
    },
    error: {
      icon: <XCircle className="h-10 w-10 text-destructive" />,
      title: 'Lien invalide',
      desc: 'Ce lien de désabonnement est invalide ou a expiré.',
      action: null,
    },
  };

  const c = content[state];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
          {c.icon}
          <h1 className="font-heading text-xl font-semibold text-foreground">{c.title}</h1>
          {c.desc && <p className="text-sm text-muted-foreground">{c.desc}</p>}
          {c.action}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnsubscribePage;
