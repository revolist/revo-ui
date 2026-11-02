import { h } from 'preact';
import type { ComponentApi } from './api-types';
import { PageContents } from './page-contents';

export function ApiContents({ component }: { component: ComponentApi }) {
  const items = [
    { id: 'api-props', title: 'Props' },
    { id: 'api-events-and-callbacks', title: 'Events and callbacks' },
    { id: 'api-methods', title: 'Methods' },
  ];
  if (
    [...component.props, ...component.events].some((member) => member.inherited)
  )
    items.push({ id: 'api-inherited', title: 'Inherited HTML attributes' });
  return <PageContents label="API page contents" items={items} />;
}
