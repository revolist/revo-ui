import { h, Fragment, type ComponentChildren } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { SegmentedSwitch } from './segmented-switch/index';

/** Application-owned content. Return cleanup when mounting another framework or UI. */
export interface ConfiguratorSection {
  id: string;
  label: string;
  hidden?: boolean;
  disabled?: boolean;
  render?: () => ComponentChildren;
  mount?: (host: HTMLElement) => void | (() => void);
}

export interface ConfiguratorSectionsConfig {
  /** Custom tabs appended after the built-in tabs. IDs must be unique and cannot replace built-ins. */
  sections?: readonly ConfiguratorSection[];
  initialSection?: string;
  onSectionChange?: (id: string) => void;
}

/** Selection follows current availability, without discarding mounted editor drafts. */
export function useConfiguratorSections(
  config: ConfiguratorSectionsConfig,
  builtins: readonly ConfiguratorSection[],
  disabled = false,
) {
  const ids = new Set(builtins.map((section) => section.id));
  const custom = (config.sections ?? []).filter((section) => {
    if (!section.id || ids.has(section.id)) return false;
    ids.add(section.id);
    return true;
  });
  const sections = [...builtins, ...custom]
    .filter((section) => !section.hidden)
    .map((section) => (disabled ? { ...section, disabled: true } : section));
  const [requested, setRequested] = useState(
    config.initialSection ?? builtins[0]?.id,
  );
  const active =
    sections.find(
      (section) => section.id === requested && (disabled || !section.disabled),
    )?.id ??
    sections.find((section) => !section.disabled)?.id ??
    (disabled ? sections[0]?.id : undefined);
  const select = (id: string) => {
    if (
      id === active ||
      !sections.some((section) => section.id === id && !section.disabled)
    )
      return;
    setRequested(id);
    config.onSectionChange?.(id);
  };
  return {
    sections,
    custom: sections.filter(
      (section) => !builtins.some((builtin) => builtin.id === section.id),
    ),
    active,
    select,
  };
}

/** Shared switch spacing and opaque sticky backdrop for every configurator. */
export function ConfiguratorHeader({
  children,
  className = '',
}: {
  children?: ComponentChildren;
  className?: string;
}) {
  return (
    <header className={`rv-configurator-header ${className}`}>
      {children}
    </header>
  );
}

export function ConfiguratorSectionTabs({
  sections,
  active,
  onChange,
  prefix,
  label,
  className = '',
}: {
  sections: readonly ConfiguratorSection[];
  active?: string;
  onChange: (id: string) => void;
  prefix: string;
  label: string;
  className?: string;
}) {
  return (
    <SegmentedSwitch
      value={active ?? ''}
      ariaLabel={label}
      role="tablist"
      className={`rv-configurator-section-tabs ${className}`}
      options={sections.map((section) => ({
        value: section.id,
        label: section.label,
        disabled: section.disabled,
        id: `${prefix}-tab-${section.id}`,
        ariaControls: `${prefix}-panel-${section.id}`,
      }))}
      onChange={onChange}
    />
  );
}

function MountedSection({ section }: { section: ConfiguratorSection }) {
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (host.current && section.mount) return section.mount(host.current);
  }, [section.mount]);
  return (
    <div ref={host} class="rv-configurator-section-content">
      {section.render?.()}
    </div>
  );
}

/** Inactive sections retain chat transcripts and host drafts until removed. */
export function ConfiguratorSectionPanels({
  sections,
  active,
  prefix,
}: {
  sections: readonly ConfiguratorSection[];
  active?: string;
  prefix: string;
}) {
  return (
    <>
      {sections.map((section) => (
        <CustomSection
          key={section.id}
          section={section}
          active={active === section.id}
          prefix={prefix}
        />
      ))}
    </>
  );
}

function CustomSection({
  section,
  active,
  prefix,
}: {
  section: ConfiguratorSection;
  active: boolean;
  prefix: string;
}) {
  const visited = useRef(false);
  if (active) visited.current = true;
  return (
    <section
      hidden={!active}
      role="tabpanel"
      id={`${prefix}-panel-${section.id}`}
      aria-labelledby={`${prefix}-tab-${section.id}`}
      class="rv-configurator-custom-section"
    >
      {visited.current && <MountedSection section={section} />}
    </section>
  );
}
