import { HTMLAttributes, ElementType } from 'react';

interface GoldTextProps extends HTMLAttributes<HTMLElement> {
  /** HTML tag to render. Default: 'span' */
  as?: ElementType;
}

/**
 * GoldText — applies metallic gold gradient text via bg-clip-text.
 * Usage: <GoldText>Tử Vi Đẩu Số</GoldText>
 */
export function GoldText({ as: Tag = 'span', children, className = '', ...rest }: GoldTextProps) {
  return (
    <Tag
      className={['bg-clip-text text-transparent bg-gold-metal', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
