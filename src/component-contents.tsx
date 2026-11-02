import { h } from 'preact';
import { examples, slug } from './example-source';
import { PageContents } from './page-contents';

export function ComponentContents({ family }: { family: string }) {
  const items = examples
    .filter((example) => example.family === family)
    .map((example) => ({
      id: `example-${slug(example.title)}`,
      title: example.title,
    }));
  items.push({ id: `${slug(family)}-api`, title: 'API reference' });
  return <PageContents label="Component page contents" items={items} />;
}
