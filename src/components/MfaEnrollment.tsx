import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocale } from '@/contexts/LocaleContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';

interface MfaEnrollmentProps {
  onStatusChange?: () => void;
}

export const MfaEnrollment: React.FC<MfaEnrollmentProps> = ({ onStatusChange }) => {
  const { t } = useLocale();
  const [enrolling, setEnrolling] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [disabling, setDisabling] = useState(false);

  // Check MFA status on mount
  React.useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setIsEnrolled(false);
      return;
    }
    const verified = data.totp.filter(f => f.status === 'verified');
    setIsEnrolled(verified.length > 0);
  };

  const handleStartEnroll = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Solexi Authenticator',
      });
      if (error) throw error;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
    } catch {
      toast.error(t.mfa_error);
    }
    setEnrolling(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || verifyCode.length !== 6) return;
    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });
      if (verifyError) {
        toast.error(t.mfa_invalid_code);
        setVerifying(false);
        return;
      }

      toast.success(t.mfa_success);
      setIsEnrolled(true);
      setQrCode(null);
      setFactorId(null);
      setVerifyCode('');
      onStatusChange?.();
    } catch {
      toast.error(t.mfa_error);
    }
    setVerifying(false);
  };

  const handleDisable = async () => {
    setDisabling(true);
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp.filter(f => f.status === 'verified') ?? [];
      for (const factor of verified) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
      setIsEnrolled(false);
      toast.success(t.mfa_disabled_success);
      onStatusChange?.();
    } catch {
      toast.error(t.mfa_error);
    }
    setDisabling(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          {t.mfa_title}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {t.mfa_desc}
          {isEnrolled !== null && (
            <Badge variant={isEnrolled ? 'default' : 'secondary'} className="ml-auto">
              {isEnrolled ? (
                <><ShieldCheck className="h-3 w-3 mr-1" />{t.mfa_enabled}</>
              ) : (
                <><ShieldOff className="h-3 w-3 mr-1" />{t.mfa_disabled}</>
              )}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Not enrolled — show enable button */}
        {isEnrolled === false && !qrCode && (
          <Button onClick={handleStartEnroll} disabled={enrolling} variant="outline">
            {enrolling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t.mfa_enable_btn}
          </Button>
        )}

        {/* QR code enrollment flow */}
        {qrCode && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t.mfa_scan_qr}</p>
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48" />
            </div>
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="mfa-code">{t.mfa_enter_code}</Label>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoComplete="one-time-code"
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <Button type="submit" disabled={verifying || verifyCode.length !== 6} className="w-full">
                {verifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {verifying ? t.mfa_verifying : t.mfa_verify}
              </Button>
            </form>
          </div>
        )}

        {/* Enrolled — show disable button */}
        {isEnrolled === true && (
          <Button onClick={handleDisable} disabled={disabling} variant="destructive" size="sm">
            {disabling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t.mfa_disable_btn}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
