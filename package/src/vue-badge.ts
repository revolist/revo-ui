import { h, type FunctionalComponent } from 'vue';
import { badgeClassName, type BadgeOptions } from './badge';

/** Vue owns rendering and slots; shared UI owns badge presentation. */
export const VueBadge: FunctionalComponent<BadgeOptions> = (props, { slots }) =>
  h('span', { class: badgeClassName(props) }, slots.default?.());

VueBadge.props = ['variant', 'shape'];
