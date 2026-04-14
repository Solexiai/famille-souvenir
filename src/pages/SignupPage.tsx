import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const signupSchema = z.object({
    fullName: z.string().trim().min(2, t.auth_validation_name_min).max(100),
    email: z.string().trim().email(t.auth_validation_email).max(255),
    password: z.string()
      .min(8, t.auth_validation_password_min)
      .regex(/[A-Z]/, t.auth_validation_password_upper)
      .regex(/[a-z]/, t.auth_validation_password_lower)
      .regex(/[0-9]/, t.auth_validation_password_digit),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t.auth_validation_password_mismatch,
    path: ['confirmPassword'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, redirectTo || undefined);
    setLoading(false);
    if (error) {
      toast.error(t.auth_signup_error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="font-heading text-xl">{t.auth_verify_email_title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.auth_verify_email_desc.replace('{email}', email) }} />
            <Link to={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}>
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
          <p className="mt-2 text-muted-foreground">{t.auth_signup_desc}</p>
        </div>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-xl">{t.auth_signup_title}</CardTitle>
            <CardDescription>{t.auth_signup_desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.auth_full_name}</Label>
                <Input
                  id="fullName"
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="password">{t.auth_password}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <p className="text-xs text-muted-foreground">{t.auth_password_hint}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.auth_confirm_password}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.auth_submit_signup}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t.auth_has_account}{' '}
              <Link to={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-accent hover:underline">
                {t.sign_in}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
