import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export type ContentsItem = { id: string; title: string };

export function PageContents({
  items,
  label,
}: {
  items: ContentsItem[];
  label: string;
}) {
  const [active, setActive] = useState(items[0]?.id);
  const key = items.map((item) => item.id).join('|');
  useEffect(() => {
    const update = () => {
      const headings = items
        .map((item) => document.getElementById(item.id))
        .filter((element): element is HTMLElement => !!element);
      const fragment = headings.find(element => `#${element.id}` === location.hash);
      if (fragment && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4 && fragment.getBoundingClientRect().top < window.innerHeight) {
        setActive(fragment.id);
        return;
      }
      const current =
        headings
          .filter((element) => element.getBoundingClientRect().top <= 150)
          .at(-1) ?? headings[0];
      if (current) setActive(current.id);
    };
    update();
    const frame = requestAnimationFrame(() => {
      const target = items.find((item) => `#${item.id}` === location.hash);
      if (target)
        document.getElementById(target.id)?.scrollIntoView({ block: 'start' });
    });
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
    };
  }, [key]);
  return (
    <aside class="page-contents">
      <nav aria-label={label}>
        <h2>On this page</h2>
        {items.map((item) => (
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? 'location' : undefined}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}
