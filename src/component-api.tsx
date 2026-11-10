import { h, createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { Disclosure } from '@revolist/ui/preact';
import { SvgIcon } from '@revolist/ui/icons/icon';
import chevronRight from '@fortawesome/fontawesome-free/svgs/solid/chevron-right.svg?raw';

import type {
  ApiMember as Member,
  ApiType,
  TypeLink,
  ComponentApi,
} from './api-types';
export type { ComponentApi } from './api-types';
import { apiHref } from './routing';

function Chevron() {
  return <SvgIcon svg={chevronRight} className="component-api-chevron" />;
}

function TypeSignature({ value }: { value: string }) {
  return (
    <code class="component-api-type">
      {value
        .split(
          /("[^"]*"|'[^']*'|\b(?:boolean|string|number|undefined|null|void)\b)/g,
        )
        .map((token, index) => (
          <span
            key={index}
            class={
              /^["']/.test(token)
                ? 'component-api-literal'
                : /^(boolean|string|number|undefined|null|void)$/.test(token)
                  ? 'component-api-keyword'
                  : undefined
            }
          >
            {token}
          </span>
        ))}
    </code>
  );
}

const TypeContext = createContext<ReadonlyMap<string, ApiType>>(new Map());

function TypeValue({
  value,
  ancestry = [],
}: {
  value: TypeLink;
  ancestry?: string[];
}) {
  const types = useContext(TypeContext);
  const [open, setOpen] = useState(false);
  const definition = value.typeId ? types.get(value.typeId) : undefined;
  if (!definition) return <TypeSignature value={value.type} />;
  if (ancestry.includes(definition.id))
    return (
      <div>
        <TypeSignature value={value.type} />
        <p class="component-api-type-note">
          Recursive reference to a type already shown above.
        </p>
      </div>
    );
  return (
    <Disclosure
      className="component-api-type-disclosure"
      onToggle={(event) => setOpen(event.currentTarget.open)}
      summary={
        <>
          <TypeSignature value={value.type} />
          <Chevron />
          <span class="rv-visually-hidden">Inspect type</span>
        </>
      }
    >
      {open && (
        <div class="component-api-type-content">
          <TypeDefinition
            definition={definition}
            ancestry={[...ancestry, definition.id]}
          />
        </div>
      )}
    </Disclosure>
  );
}

function TypeFields({
  fields,
  ancestry,
}: {
  fields: Member[];
  ancestry: string[];
}) {
  return (
    <ul class="component-api-type-fields">
      {fields.map((field) => (
        <li key={field.name}>
          <div class="component-api-type-field-name">
            <code>{field.name}</code>
            <span>{field.required ? 'Required' : 'Optional'}</span>
          </div>
          <TypeValue value={field} ancestry={ancestry} />
          {field.description && <p>{field.description}</p>}
        </li>
      ))}
    </ul>
  );
}

function TypeDefinition({
  definition,
  ancestry,
}: {
  definition: ApiType;
  ancestry: string[];
}) {
  const types = useContext(TypeContext);
  const concrete = definition.variants.filter(
    (variant) => variant.type !== 'undefined' && variant.type !== 'null',
  );
  const inner =
    concrete.length === 1 && concrete[0].typeId
      ? types.get(concrete[0].typeId)
      : undefined;
  if (inner && !ancestry.includes(inner.id))
    return (
      <>
        {definition.variants.some((variant) => variant.type === 'null') && (
          <p class="component-api-type-note">May also be null.</p>
        )}
        <TypeDefinition definition={inner} ancestry={[...ancestry, inner.id]} />
      </>
    );
  const hasShape =
    definition.variants.length ||
    definition.properties.length ||
    definition.calls.length ||
    definition.element ||
    definition.indexes.length ||
    definition.constraint;
  return (
    <>
      {definition.description && <p>{definition.description}</p>}
      {!!definition.variants.length && (
        <>
          <h5>Allowed forms</h5>
          <div class="component-api-type-variants">
            {definition.variants.map((variant, index) => (
              <TypeValue key={index} value={variant} ancestry={ancestry} />
            ))}
          </div>
        </>
      )}
      {definition.element && (
        <>
          <h5>Array item</h5>
          <TypeValue value={definition.element} ancestry={ancestry} />
        </>
      )}
      {!!definition.properties.length && (
        <>
          <h5>
            Fields <span>{definition.properties.length}</span>
          </h5>
          <TypeFields fields={definition.properties} ancestry={ancestry} />
        </>
      )}
      {definition.calls.map((call, index) => (
        <div key={index}>
          <h5>
            {definition.calls.length > 1
              ? `Call signature ${index + 1}`
              : 'Callback signature'}
          </h5>
          {call.parameters.length ? (
            <TypeFields fields={call.parameters} ancestry={ancestry} />
          ) : (
            <p>No arguments.</p>
          )}
          <h5>Returns</h5>
          <TypeValue value={call.returns} ancestry={ancestry} />
        </div>
      ))}
      {definition.indexes.map((index, key) => (
        <div key={key}>
          <h5>Keys: {index.key}</h5>
          <TypeValue value={index} ancestry={ancestry} />
        </div>
      ))}
      {definition.constraint && (
        <>
          <h5>Type constraint</h5>
          <TypeValue value={definition.constraint} ancestry={ancestry} />
        </>
      )}
      {!hasShape && (
        <>
          <TypeSignature value={definition.definition} />
          {definition.external && (
            <p class="component-api-type-note">
              Standard framework or browser type. The declared type name and its
              library documentation are retained here.
            </p>
          )}
        </>
      )}
    </>
  );
}

function MemberTable({
  title,
  members,
  methods = false,
}: {
  title: string;
  members: Member[];
  methods?: boolean;
}) {
  return (
    <div
      class="component-api-table"
      tabIndex={0}
      role="region"
      aria-label={title}
    >
      <table>
        <caption class="rv-visually-hidden">{title}</caption>
        <colgroup>
          <col class="component-api-name-column" />
          <col class="component-api-type-column" />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">{methods ? 'Signature' : 'Type'}</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.name}>
              <th scope="row">
                <code class="component-api-name">{member.name}</code>
                {!methods && (
                  <span
                    class={`component-api-necessity${member.required ? ' is-required' : ''}`}
                  >
                    {member.required ? 'Required' : 'Optional'}
                  </span>
                )}
              </th>
              <td>
                <TypeValue value={member} />
              </td>
              <td class="component-api-description">
                {member.description ||
                  (!member.via && (
                    <span
                      class="component-api-unspecified"
                      aria-label="No description"
                    >
                      —
                    </span>
                  ))}
                {member.via && (
                  <p>
                    Available through <code>{member.via}</code>.
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MemberHeading({ title, count }: { title: string; count: number }) {
  return (
    <h4
      id={`api-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      class="component-api-member-heading"
    >
      {title}
      <span>{count}</span>
    </h4>
  );
}

export function ComponentReference({
  component,
  expanded = false,
}: {
  component: ComponentApi;
  expanded?: boolean;
}) {
  const types = useMemo(
    () => new Map(component.types.map((type) => [type.id, type])),
    [component.types],
  );
  const [open, setOpen] = useState(expanded);
  const [nativeOpen, setNativeOpen] = useState(false);
  const props = component.props.filter((member) => !member.inherited);
  const events = component.events.filter((member) => !member.inherited);
  const inheritedProps = component.props.filter((member) => member.inherited);
  const inheritedEvents = component.events.filter((member) => member.inherited);
  return (
    <TypeContext.Provider value={types}>
      <Disclosure
        className="component-api-component"
        open={expanded || undefined}
        onToggle={(event) => {
          setOpen(event.currentTarget.open);
          if (!event.currentTarget.open) setNativeOpen(false);
        }}
        summary={
          <>
            <Chevron />
            <code>{component.name}</code>
            <span class="component-api-counts">
              <span>{props.length} props</span>
              <span>{events.length} callbacks</span>
              <span>{component.methods.length} methods</span>
            </span>
          </>
        }
      >
        {open && (
          <div class="component-api-content">
            <MemberHeading title="Props" count={props.length} />
            {props.length ? (
              <MemberTable title={`${component.name} props`} members={props} />
            ) : (
              <p class="component-api-empty">No component-specific props.</p>
            )}
            <MemberHeading title="Events and callbacks" count={events.length} />
            {events.length ? (
              <MemberTable
                title={`${component.name} events and callbacks`}
                members={events}
              />
            ) : (
              <p class="component-api-empty">
                No component-specific events or callbacks.
              </p>
            )}
            <MemberHeading title="Methods" count={component.methods.length} />
            {component.methods.length ? (
              <MemberTable
                title={`${component.name} methods`}
                members={component.methods}
                methods
              />
            ) : (
              <p class="component-api-empty">
                No component-specific imperative methods. Use props and
                callbacks to control this component.
              </p>
            )}
            {!!(inheritedProps.length + inheritedEvents.length) && (
              <div id="api-inherited">
                <Disclosure
                  className="component-api-inherited"
                  onToggle={(event) => setNativeOpen(event.currentTarget.open)}
                  summary={
                    <>
                      <Chevron />
                      <span>Inherited HTML props and events</span>
                      <span class="component-api-inherited-count">
                        {inheritedProps.length + inheritedEvents.length}
                      </span>
                    </>
                  }
                >
                  {nativeOpen && !!inheritedProps.length && (
                    <MemberTable
                      title={`${component.name} inherited props`}
                      members={inheritedProps}
                    />
                  )}
                  {nativeOpen && !!inheritedEvents.length && (
                    <MemberTable
                      title={`${component.name} inherited events`}
                      members={inheritedEvents}
                    />
                  )}
                </Disclosure>
              </div>
            )}
          </div>
        )}
      </Disclosure>
    </TypeContext.Provider>
  );
}

export function ApiReference({ family }: { family: string }) {
  const [components, setComponents] = useState<ComponentApi[]>();
  useEffect(() => {
    import('virtual:component-api').then(({ default: api }) =>
      setComponents(api.filter((item) => item.families.includes(family))),
    );
  }, [family]);
  return (
    <section
      class="component-api"
      aria-busy={!components}
      id={`${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-api`}
    >
      <h3>API reference</h3>
      <p>Explore the complete contracts and inspect complex types.</p>
      <nav class="api-family-links" aria-label={`${family} API pages`}>
        {components?.map((item) => (
          <a href={apiHref(item.name)}>
            {item.name}
            <span>View API →</span>
          </a>
        ))}
      </nav>
    </section>
  );
}
