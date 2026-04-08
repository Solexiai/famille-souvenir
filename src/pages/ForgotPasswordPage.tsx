import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const schema = z.object({
    email: z.string().trim().email(t.auth_validation_email),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(t.auth_reset_error);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="font-heading text-xl">{t.auth_email_sent_title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.auth_email_sent_desc.replace('{email}', email) }} />
            <Link to="/login">
              <Button variant="outline" className="w-full">{t.auth_back_to_login}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-semibold text-foreground">{t.app_name} {t.app_tagline}</h1>
        </div>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-xl">{t.auth_forgot_title}</CardTitle>
            <CardDescription>{t.auth_forgot_desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth_email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.auth_send_reset}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-accent hover:underline">
                {t.auth_back_to_login}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
