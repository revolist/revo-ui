import { h, type JSX } from 'preact';
import starSolid from '@fortawesome/fontawesome-free/svgs/solid/star.svg?raw';
import starOutline from '@fortawesome/fontawesome-free/svgs/regular/star.svg?raw';
import { SvgIcon } from './icons/icon';
import { ButtonControl } from './native-control';

export function RatingStar({ filled }: { filled: boolean }) {
  return (
    <span class="rv-rating__star" data-filled={filled ? 'true' : 'false'}>
      <SvgIcon svg={filled ? starSolid : starOutline} />
    </span>
  );
}

/** Native radio-style choice for rating domains, including fractional values. */
export function RatingChoice({
  filled,
  selected,
  label,
  className = '',
  ...props
}: Omit<JSX.IntrinsicElements['button'], 'class' | 'className' | 'children'> & {
  filled: boolean;
  selected: boolean;
  label: string;
  className?: string;
}) {
  return (
    <ButtonControl
      {...props}
      type="button"
      class={`rv-rating-choice ${className}`}
      role="radio"
      aria-checked={selected}
      aria-label={label}
    >
      <RatingStar filled={filled} />
    </ButtonControl>
  );
}
