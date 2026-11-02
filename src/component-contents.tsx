import { h, type RefObject } from 'preact';
import { useLayoutEffect, useState } from 'preact/hooks';
import { slug } from './example-source';
import { PageContents, type ContentsItem } from './page-contents';

export function ComponentContents({
  family,
  content,
}: {
  family: string;
  content: RefObject<HTMLDivElement>;
}) {
  const [examples, setExamples] = useState<ContentsItem[]>([]);
  useLayoutEffect(() => {
    // The rendered page owns example order, including examples inside compositions.
    const entries = Array.from(
      content.current?.querySelectorAll<HTMLElement>('.catalog-example') ?? [],
    ).map((element) => ({
      id: element.id,
      title: element.querySelector('h3')?.textContent?.trim() ?? '',
    }));
    setExamples(entries.filter((entry) => entry.id && entry.title));
  }, [family, content]);
  const items = [
    ...examples,
    { id: `${slug(family)}-api`, title: 'API reference' },
  ];
  return <PageContents label="Component page contents" items={items} />;
}
