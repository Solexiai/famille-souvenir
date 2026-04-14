import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocale } from '@/contexts/LocaleContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface MfaChallengeProps {
  onVerified: () => void;
}

export const MfaChallenge: React.FC<MfaChallengeProps> = ({ onVerified }) => {
  const { t } = useLocale();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setVerifying(true);

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp.find(f => f.status === 'verified');
      if (!totpFactor) {
        toast.error(t.mfa_challenge_error);
        setVerifying(false);
        return;
      }

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        toast.error(t.mfa_challenge_error);
        setCode('');
        setVerifying(false);
        return;
      }

      onVerified();
    } catch {
      toast.error(t.mfa_challenge_error);
    }
    setVerifying(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <ShieldCheck className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-heading text-xl">{t.mfa_challenge_title}</CardTitle>
            <CardDescription>{t.mfa_challenge_desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfa-challenge-code">{t.mfa_enter_code}</Label>
                <Input
                  id="mfa-challenge-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoComplete="one-time-code"
                  autoFocus
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={verifying || code.length !== 6}>
                {verifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t.mfa_challenge_submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
