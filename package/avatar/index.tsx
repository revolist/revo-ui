import { TooltipText } from '../core/tooltip-text';
import { h } from 'preact';
import { AVATAR_CELL_BACKGROUNDS } from '../color-palette/common-palettes';

import { useState } from 'preact/hooks';
import { createPreactElement } from '../preact-mount';

export { AVATAR_CELL_BACKGROUNDS } from '../color-palette/common-palettes';

export type AvatarTemplateOptions = {
  ariaLabel?: string;
  className?: string;
  index?: number;
  initials?: string;
  key?: string | number;
  label?: string;
  rectangular?: boolean;
  size?: number;
  style?: Record<string, string | number | null | undefined>;
  value?: unknown;
};

/** Shared Preact avatar, including image-error fallback. */
export function AvatarElement({
  options = {},
}: {
  options?: AvatarTemplateOptions;
}) {
  const [failed, setFailed] = useState(false);
  const { index = 0, initials, rectangular = false, size, value } = options;
  const className = [
    'avatar-cell',
    `avatar-cell--${Math.max(index, 0) % AVATAR_CELL_BACKGROUNDS.length}`,
    rectangular ? 'avatar-cell--rectangular rectangular' : '',
    getAvatarSizeClass(size),
    options.className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <TooltipText
      class={className}
      title={options.label || String(value ?? '')}
      role="img"
      aria-label={options.ariaLabel || options.label || undefined}
      style={options.style}
    >
      {isImageSource(value) && !failed ? (
        <img
          class="avatar-cell__image"
          src={String(value)}
          alt={options.label || ''}
          onError={() => setFailed(true)}
        />
      ) : (
        (initials ?? getAvatarInitials(value))
      )}
    </TooltipText>
  );
}

export function createAvatarElement(
  document: Document,
  options: AvatarTemplateOptions = {},
): HTMLSpanElement {
  return createPreactElement(document, <AvatarElement options={options} />);
}

export function getAvatarCellBackground(index = 0) {
  return AVATAR_CELL_BACKGROUNDS[
    Math.max(index, 0) % AVATAR_CELL_BACKGROUNDS.length
  ];
}

export function getAvatarInitials(value: unknown) {
  return String(value ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function isImageSource(value: unknown) {
  return (
    typeof value === 'string' &&
    /^(https?:|data:image\/|blob:|\/|\.\.?\/)/.test(value)
  );
}

export function getAvatarIndex(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(numericValue - 1, 0) : 0;
}

function getAvatarSizeClass(size?: number) {
  if (!size) {
    return undefined;
  }

  if (size <= 16) {
    return 'avatar-cell--size-16';
  }

  if (size <= 20) {
    return 'avatar-cell--size-20';
  }

  if (size <= 32) {
    return 'avatar-cell--size-32';
  }

  if (size <= 40) {
    return 'avatar-cell--size-40';
  }

  return 'avatar-cell--size-48';
}

export function avatarTemplate(h: any, options: AvatarTemplateOptions = {}) {
  const { index = 0, initials, rectangular = false, size, value } = options;
  const image = isImageSource(value);
  const sizeClass = getAvatarSizeClass(size);
  const toneClass = `avatar-cell--${Math.max(index, 0) % AVATAR_CELL_BACKGROUNDS.length}`;
  const className = [
    'avatar-cell',
    toneClass,
    rectangular ? 'avatar-cell--rectangular rectangular' : '',
    sizeClass,
    options.className,
  ]
    .filter(Boolean)
    .join(' ');
  const props: Record<string, unknown> = {
    role: 'img',
    class: className,
    title: options.label || String(value ?? ''),
  };
  if (options.key !== undefined) props.key = options.key;
  if (options.style !== undefined) props.style = options.style;
  if (options.ariaLabel !== undefined) props['aria-label'] = options.ariaLabel;

  if (image) {
    return h('span', props, [
      h('img', {
        class: 'avatar-cell__image',
        src: String(value),
        alt: options.label || '',
      }),
    ]);
  }

  return h('span', props, initials ?? getAvatarInitials(value));
}

/** Shared avatar-and-label presentation; resource/row lookup stays with consumers. */
export function avatarWithTextTemplate(
  h: any,
  options: AvatarTemplateOptions = {},
) {
  return h('span', { class: 'avatar-cell-with-text' }, [
    avatarTemplate(h, options),
    h(
      'span',
      { class: 'avatar-cell-with-text__label' },
      String(options.label ?? options.value ?? ''),
    ),
  ]);
}
