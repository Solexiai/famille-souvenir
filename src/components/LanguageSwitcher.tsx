import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocale } from '@/contexts/LocaleContext';
import { SupportedLanguage } from '@/i18n/types';
import { LANGUAGE_ORDER, LANGUAGE_LABELS } from '@/i18n/config';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * Standardized language switcher available across the app.
 * Persists choice via LocaleContext (localStorage `solexi_lang`).
 */
export const LanguageSwitcher: React.FC<Props> = ({ variant = 'default', className }) => {
  const { lang, setLang } = useLocale();
  const compact = variant === 'compact';

  return (
    <Select value={lang} onValueChange={(v) => setLang(v as SupportedLanguage)}>
      <SelectTrigger
        className={cn(
          compact ? 'h-8 w-[5.5rem] text-xs gap-1' : 'h-10 w-[8rem] text-sm gap-2',
          className,
        )}
        aria-label="Language"
      >
        <Globe className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {LANGUAGE_ORDER.map((code) => (
          <SelectItem key={code} value={code}>
            {compact ? code.toUpperCase() : LANGUAGE_LABELS[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
