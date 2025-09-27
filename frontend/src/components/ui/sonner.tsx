'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-center"
      richColors={true}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',

          '--success-bg': 'var(--secondary-background)',
          '--success-border': 'var(--secondary)',
          '--success-text': 'var(--secondary)',

          '--info-bg': 'var(--primary-background)',
          '--info-border': 'var(--primary)',
          '--info-text': 'var(--primary)',

          '--warning-bg': 'var(--warning-background)',
          '--warning-border': 'var(--warning)',
          '--warning-text': 'var(--warning)',

          '--error-bg': 'var(--destructive-background)',
          '--error-border': 'var(--destructive)',
          '--error-text': 'var(--destructive)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
