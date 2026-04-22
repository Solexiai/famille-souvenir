import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Lock, FileText, Download, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { VaultDocument, VaultVisibility, FamilyCircle } from '@/types/database';
import { useLocale } from '@/contexts/LocaleContext';

const VaultPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const visibilityLabels: Record<VaultVisibility, string> = {
    owner: t.vault_visibility_owner,
    managers: t.vault_visibility_managers,
    circle: t.vault_visibility_circle,
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
      if (!circles || circles.length === 0) { setLoading(false); return; }
      const c = circles[0] as FamilyCircle;
      setCircle(c);
      const { data } = await supabase
        .from('vault_documents')
        .select('*')
        .eq('circle_id', c.id)
        .order('created_at', { ascending: false });
      setDocuments((data as VaultDocument[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t.vault_banner_title}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t.vault_banner_desc}
                </p>
                <Button size="sm" variant="outline" className="gap-2 mt-1" onClick={() => navigate('/documents')}>
                  <ArrowRight className="h-4 w-4" />
                  {t.vault_banner_cta}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-6 w-6 text-muted-foreground" />
            {t.vault_title}
            <Badge variant="outline" className="text-xs ml-2">{t.vault_archives_badge}</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.vault_subtitle}
          </p>
        </div>

        {documents.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.vault_empty}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="shadow-soft opacity-90">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-secondary p-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{visibilityLabels[doc.visibility]}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (doc.file_url && !/^https?:\/\//i.test(doc.file_url)) {
                          const { data } = await supabase.storage
                            .from('vault-private')
                            .createSignedUrl(doc.file_url, 300);
                          if (data?.signedUrl) {
                            window.open(data.signedUrl, '_blank');
                          } else {
                            toast.error(t.vault_download_error);
                          }
                        } else {
                          window.open(doc.file_url, '_blank');
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default VaultPage;
