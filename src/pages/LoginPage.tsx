import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const INVITATION_TOKEN_KEY = 'solexi_invitation_token';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const loginSchema = z.object({
    email: z.string().trim().email(t.auth_validation_email),
    password: z.string().min(1, t.auth_validation_password_required),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      toast.error(t.auth_invalid_credentials);
      return;
    }

    // After login, check if there's a pending invitation token
    const invitationToken = localStorage.getItem(INVITATION_TOKEN_KEY);
    if (invitationToken) {
      try {
        const { data } = await supabase.functions.invoke('manage-invitation', {
          body: { action: 'accept', token: invitationToken },
        });
        localStorage.removeItem(INVITATION_TOKEN_KEY);
        if (data?.success) {
          toast.success(data.message || 'Vous avez rejoint le cercle !');
        } else if (data?.error) {
          toast.error(data.error);
        }
      } catch {
        // Non-blocking: invitation acceptance failed but login succeeded
        localStorage.removeItem(INVITATION_TOKEN_KEY);
      }
      setLoading(false);
      navigate('/dashboard');
    } else {
      setLoading(false);
      navigate(redirectTo || '/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-semibold text-foreground">{t.app_name} {t.app_tagline}</h1>
          <p className="mt-2 text-muted-foreground">{t.auth_app_subtitle}</p>
        </div>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-xl">{t.auth_login_title}</CardTitle>
            <CardDescription>{t.auth_login_desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth_email}</Label>
                <Input id="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.auth_password}</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.auth_submit_login}
              </Button>
            </form>
            <div className="mt-4 flex flex-col gap-2 text-center text-sm">
              <Link to="/forgot-password" className="text-accent hover:underline">{t.auth_forgot_password}</Link>
              <p className="text-muted-foreground">
                {t.auth_no_account}{' '}
                <Link to="/signup" className="text-accent hover:underline">{t.auth_create_account}</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
