import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, MailX } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const UnsubscribePage: React.FC = () => {
  const { t } = useLocale();
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
      title: t.unsub_loading,
      desc: null,
      action: null,
    },
    valid: {
      icon: <MailX className="h-10 w-10 text-muted-foreground" />,
      title: t.unsub_valid_title,
      desc: t.unsub_valid_desc,
      action: (
        <Button onClick={handleUnsubscribe} disabled={processing} className="w-full max-w-xs">
          {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {t.unsub_confirm_btn}
        </Button>
      ),
    },
    already: {
      icon: <CheckCircle className="h-10 w-10 text-accent" />,
      title: t.unsub_already_title,
      desc: t.unsub_already_desc,
      action: null,
    },
    success: {
      icon: <CheckCircle className="h-10 w-10 text-accent" />,
      title: t.unsub_success_title,
      desc: t.unsub_success_desc,
      action: null,
    },
    error: {
      icon: <XCircle className="h-10 w-10 text-destructive" />,
      title: t.unsub_error_title,
      desc: t.unsub_error_desc,
      action: null,
    },
  };

  const c = content[state];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
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
