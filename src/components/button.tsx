import { CSSProperties, MutableRefObject } from 'react';

export enum ButtonAppearance {
  Primary = 'primary',
  Secondary = 'secondary',
  Jumbo = 'jumbo',
  JumboNumber = 'jumboNumber',
  Danger = 'danger',
  Transparent = 'transparent',
  TransparentWhite = 'transparentWhite',
  Link = 'link',
  Icon = 'icon',
}

const appearanceStyles: Record<ButtonAppearance, string> = {
  primary: `
    bg-sky-500
    text-white
    shadow-sm
    hover:bg-sky-600
    disabled:bg-gray-300
    disabled:text-gray-500
    disabled:border-gray-800
  `,
  secondary: ``,
  jumbo: ``,
  jumboNumber: ``,
  danger: ``,
  transparent: ``,
  transparentWhite: ``,
  link: ``,
  icon: ``,
};

export enum ButtonSize {
  Auto = 'auto',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Block = 'block',
}

const sizeStyles: Record<ButtonSize, string> = {
  auto: 'py-0 px-5',
  block: 'w-full',
  small: 'py-0 px-3',
  medium: 'py-0 px-5',
  large: 'py-0 px-7',
};

export type ButtonProps = {
  type?: 'button' | 'submit';
  clickHandler?: (event: any) => void;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  id?: string;
  linkColor?: string;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  isSubmittingText?: string;
  style?: CSSProperties;
  children?: any;
  ref?: MutableRefObject<any>;
  className?: string;
  onFocus?: (event: any) => void;
  onBlur?: (event: any) => void;
};

export function Button({
  type = 'button',
  clickHandler = () => {},
  appearance = ButtonAppearance.Primary,
  size = ButtonSize.Auto,
  linkColor,
  id,
  isDisabled = false,
  isSubmitting = false,
  isSubmittingText,
  style = {},
  ref,
  className = '',
  children,
  onFocus,
  onBlur,
}: ButtonProps) {
  return (
    <button
      id={id}
      ref={ref}
      type={type}
      style={style}
      className={`
        flex
        h-10
        cursor-pointer
        items-center
        justify-center
        overflow-hidden
        text-ellipsis
        whitespace-nowrap
        rounded-sm
        border-none
        p-0
        text-base
        transition-all
        ease-in-out
        ${appearanceStyles[appearance]}
        ${sizeStyles[size]}
      `}
      onClick={isDisabled || isSubmitting ? () => {} : clickHandler}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={(event: any) => {
        if (event.key === 'Enter') {
          clickHandler(event);
          event.stopPropagation();
        }
      }}
    >
      {isSubmitting ? <span>{isSubmittingText || 'Loading..'}</span> : children}
    </button>
  );
}
