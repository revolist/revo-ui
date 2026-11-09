import { getAvatarInitials } from '../avatar';
/** @jsxImportSource preact */
import { h } from 'preact';
import { useState } from 'preact/hooks';

import type {
  ResourcePickerId,
  ResourcePickerItem,
} from './resource-picker.types';
import { resourcePickerClasses } from './resource-picker.utils';

const RESOURCE_COLORS = [
  '#22d3ee',
  '#34d399',
  '#facc15',
  '#fb7185',
  '#a78bfa',
  '#60a5fa',
  '#f97316',
  '#2dd4bf',
] as const;

export interface ResourcePickerAvatarProps<Id extends ResourcePickerId> {
  readonly resource: ResourcePickerItem<Id>;
  readonly className?: string;
  readonly color?: string;
}

export function getResourcePickerInitials(name: string): string {
  return getAvatarInitials(name) || '?';
}

export function getResourcePickerColor(id: ResourcePickerId): string {
  const hash = [...String(id)].reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return RESOURCE_COLORS[hash % RESOURCE_COLORS.length];
}

/**
 * Chooses readable initials for hex avatar colors. Unknown CSS color formats
 * retain the picker's dark foreground fallback instead of guessing.
 */
export function getResourcePickerForegroundColor(background: string): string {
  const hex = background.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (!hex) return '#0f172a';
  const expanded =
    hex.length === 3
      ? [...hex].map((character) => character.repeat(2)).join('')
      : hex;
  const channels = [0, 2, 4].map(
    (offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16) / 255,
  );
  const luminance = channels
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (sum, channel, index) =>
        sum + channel * ([0.2126, 0.7152, 0.0722][index] ?? 0),
      0,
    );
  return luminance <= 0.179 ? '#fff' : luminance < 0.25 ? '#000' : '#0f172a';
}

export function ResourcePickerAvatar<Id extends ResourcePickerId>({
  resource,
  className,
  color,
}: ResourcePickerAvatarProps<Id>) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string>();
  const label = resource.name.trim() || 'Unnamed resource';
  const imageFailed =
    !!resource.avatarUrl && failedAvatarUrl === resource.avatarUrl;
  const background =
    color ?? resource.color ?? getResourcePickerColor(resource.id);

  return (
    <span
      class={resourcePickerClasses(
        'avatar-cell rv-resource-picker__avatar',
        className,
      )}
      style={{
        '--avatar-cell-background': background,
        '--avatar-cell-size': '30px',
        '--rv-resource-picker-avatar-color':
          getResourcePickerForegroundColor(background),
      }}
      role="img"
      aria-label={label}
    >
      {resource.avatarUrl && !imageFailed ? (
        <img
          class="avatar-cell__image"
          src={resource.avatarUrl}
          alt={label}
          onError={() => setFailedAvatarUrl(resource.avatarUrl)}
        />
      ) : (
        getResourcePickerInitials(resource.name)
      )}
    </span>
  );
}
