import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Button } from '@revolist/ui/preact';

type Member = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  inherited: boolean;
  via?: string;
};
export type ComponentApi = {
  name: string;
  families: string[];
  props: Member[];
  events: Member[];
  methods: Member[];
};

function MemberTable({ title, members }: { title: string; members: Member[] }) {
  return (
    <div
      class="component-api-table"
      tabIndex={0}
      role="region"
      aria-label={title}
    >
      <table>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type / signature</th>
            <th scope="col">Required</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.name}>
              <th scope="row">
                <code>{member.name}</code>
              </th>
              <td>
                <code>{member.type}</code>
              </td>
              <td>{member.required ? 'Yes' : 'No'}</td>
              <td>
                {member.description}
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

function ComponentReference({ component }: { component: ComponentApi }) {
  const [open, setOpen] = useState(false);
  const [nativeOpen, setNativeOpen] = useState(false);
  const props = component.props.filter((member) => !member.inherited);
  const events = component.events.filter((member) => !member.inherited);
  const inheritedProps = component.props.filter((member) => member.inherited);
  const inheritedEvents = component.events.filter((member) => member.inherited);
  return (
    <details
      class="component-api-component"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <code>{component.name}</code>
        <span>
          {props.length} props · {events.length} callbacks ·{' '}
          {component.methods.length} methods
        </span>
      </summary>
      {open && (
        <div class="component-api-content">
          <h4>Props</h4>
          {props.length ? (
            <MemberTable title={`${component.name} props`} members={props} />
          ) : (
            <p>No component-specific props.</p>
          )}
          <h4>Events and callbacks</h4>
          <p>
            Pass callbacks as props. The signatures below describe the arguments
            supplied by this component.
          </p>
          {events.length ? (
            <MemberTable
              title={`${component.name} events and callbacks`}
              members={events}
            />
          ) : (
            <p>No component-specific events or callbacks.</p>
          )}
          <h4>Methods</h4>
          {component.methods.length ? (
            <MemberTable
              title={`${component.name} methods`}
              members={component.methods}
            />
          ) : (
            <p>
              No component-specific imperative methods. Use props and callbacks
              to control this component.
            </p>
          )}
          {!!(inheritedProps.length + inheritedEvents.length) && (
            <details
              onToggle={(event) => setNativeOpen(event.currentTarget.open)}
            >
              <summary>
                Inherited HTML props and events (
                {inheritedProps.length + inheritedEvents.length})
              </summary>
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
            </details>
          )}
        </div>
      )}
    </details>
  );
}

export function ApiReference({ family }: { family: string }) {
  const [components, setComponents] = useState<ComponentApi[]>();
  const [error, setError] = useState(false);
  const load = async () => {
    setError(false);
    try {
      const { default: api } = await import('virtual:component-api');
      setComponents(
        api.filter((component) => component.families.includes(family)),
      );
    } catch {
      setError(true);
    }
  };
  return (
    <details
      class="component-api"
      onToggle={(event) => {
        if (event.currentTarget.open && !components) void load();
      }}
    >
      <summary>
        API reference <span>Props, events and methods</span>
      </summary>
      <div class="component-api-content">
        <p>
          Generated from the current library’s TypeScript contracts. Includes
          inherited attributes and public controller methods exposed through
          props or callbacks. Types use the Preact contract; see Frameworks for
          adapter usage.
        </p>
        {error ? (
          <p role="alert">
            Could not load the API reference.{' '}
            <Button onClick={() => void load()}>Retry</Button>
          </p>
        ) : !components ? (
          <p role="status">Loading API reference…</p>
        ) : (
          components.map((component) => (
            <ComponentReference key={component.name} component={component} />
          ))
        )}
      </div>
    </details>
  );
}
