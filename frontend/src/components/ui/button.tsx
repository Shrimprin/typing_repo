import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/libs/shadcn/utils';

const primaryBase = `bg-primary text-primary-foreground shadow-xs`;

const buttonVariants = cva(
  `
    focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
    aria-invalid:ring-destructive/20 aria-invalid:border-destructive
    dark:aria-invalid:ring-destructive/40
    inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap
    transition-all outline-none
    disabled:pointer-events-none disabled:opacity-50
    [&_svg]:pointer-events-none [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-4
  `,
  {
    variants: {
      variant: {
        default: `
          ${primaryBase}
          hover:bg-primary/90
        `,
        primary: `
          ${primaryBase}
          hover:bg-primary/80 hover:shadow-[0_0_15px_hsl(var(--primary)_/_0.6),0_0_30px_hsl(var(--primary)_/_0.3)]
          dark:hover:bg-primary/70
        `,
        destructive: `
          bg-destructive text-white shadow-xs
          hover:bg-destructive/90
          focus-visible:ring-destructive/20
          dark:focus-visible:ring-destructive/40 dark:bg-destructive/60
        `,
        outline: `
          bg-background border-border border shadow-xs transition-all
          hover:bg-accent/20 hover:text-accent-foreground hover:border-accent
          hover:shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]
          dark:bg-input/30 dark:border-border dark:hover:bg-input/50
        `,
        secondary: `
          bg-secondary text-secondary-foreground shadow-xs
          hover:bg-secondary/80
        `,
        ghost: `
          hover:bg-accent/20 hover:text-accent-foreground hover:border-accent
          hover:shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]
          dark:hover:bg-accent/50
          transition-all
        `,
        link: `
          text-primary underline-offset-4
          hover:underline
        `,
      },
      size: {
        default: `
          h-9 px-4 py-2
          has-[>svg]:px-3
        `,
        sm: `
          h-8 gap-1.5 rounded-md px-3
          has-[>svg]:px-2.5
        `,
        lg: `
          h-10 rounded-md px-6
          has-[>svg]:px-4
        `,
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
