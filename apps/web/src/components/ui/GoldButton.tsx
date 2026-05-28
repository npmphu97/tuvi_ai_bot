'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

export type GoldButtonVariant = 'primary' | 'outline' | 'ghost';
export type GoldButtonSize = 'sm' | 'md' | 'lg';

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GoldButtonVariant;
  size?: GoldButtonSize;
  loading?: boolean;
}

const SIZE_CLASSES: Record<GoldButtonSize, string> = {
  sm: 'px-4 py-1.5 text-[12px] gap-1.5',
  md: 'px-6 py-2.5 text-[14px] gap-2',
  lg: 'px-8 py-3.5 text-[16px] gap-2.5',
};

const VARIANT_CLASSES: Record<GoldButtonVariant, string> = {
  primary:
    'bg-gold-metal text-cosmic-DEFAULT hover:brightness-110 shadow-goldGlow border border-transparent',
  outline:
    'bg-cosmic-DEFAULT border border-gold/60 text-parchment hover:border-gold hover:text-gold-light transition-colors',
  ghost:
    'bg-transparent border border-transparent text-parchment hover:text-gold transition-colors',
};

/**
 * GoldButton — mystic dark-theme button in 3 variants and 3 sizes.
 * Supports loading + disabled states. Forwards ref to the <button> element.
 */
export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  function GoldButton(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      ...rest
    },
    ref
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={[
          'inline-flex items-center justify-center rounded-full font-semibold tracking-wide transition select-none',
          SIZE_CLASSES[size],
          VARIANT_CLASSES[variant],
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {loading ? (
          <>
            <span
              className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
              aria-hidden
            />
            <span className="ml-1 opacity-70">Đang xử lý…</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
