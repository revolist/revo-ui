import { h } from 'preact';
import { useState } from 'preact/hooks';
import {
  Button,
  Dialog,
  FieldError,
  FieldHint,
  TextInput,
  Tooltip,
} from '@revolist/ui/preact';
import {
  TimelineTrack,
  type TimelineTrackEvent,
  type TimelineTrackItem,
} from '@revolist/ui/timeline-track';
import { PageContents } from './page-contents';
import { componentHref, siteHref } from './routing';

export const accessibilityArticle = {
  title: 'Accessible UI components: a practical guide · Revo UI',
  headline: 'Accessible interfaces, built into everyday work.',
  description:
    'Explore Revo UI accessibility: keyboard navigation, clear form feedback, drag alternatives, readable themes, and practical WCAG 2.2 guidance.',
  published: '2026-11-10',
};
const sections = [
  { id: 'everyday-access', title: 'Accessibility in everyday work' },
  { id: 'keyboard-and-focus', title: 'Keyboard and focus' },
  { id: 'labels-and-feedback', title: 'Labels and form feedback' },
  { id: 'alternatives-to-dragging', title: 'Alternatives to dragging' },
  { id: 'readable-interfaces', title: 'Text, color and motion' },
  { id: 'quality-and-testing', title: 'Our quality approach' },
  { id: 'integration-checklist', title: 'Your integration checklist' },
  { id: 'accessibility-help', title: 'Questions and feedback' },
];

function FeedbackExample() {
  const [name, setName] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [result, setResult] = useState('');
  return (
    <form
      class="accessibility-demo"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const missing = !name.trim();
        setInvalid(missing);
        setResult(missing ? '' : `Preview ready: ${name.trim()}.`);
        if (missing)
          (
            event.currentTarget.elements.namedItem(
              'reportName',
            ) as HTMLInputElement
          ).focus();
      }}
    >
      <h3>Try clear, recoverable feedback</h3>
      <p>
        Submit an empty name, then enter a name and try again. This example runs
        locally and sends no data.
      </p>
      <label htmlFor="accessibility-report-name">Report name (required)</label>
      <TextInput
        id="accessibility-report-name"
        name="reportName"
        value={name}
        required
        aria-invalid={invalid || undefined}
        aria-describedby={`accessibility-report-hint${invalid ? ' accessibility-report-error' : ''}`}
        onValueChange={(value) => {
          setName(value);
          setResult('');
        }}
      />
      <FieldHint id="accessibility-report-hint">
        Use a short name, such as Quarterly budget.
      </FieldHint>
      {invalid && (
        <FieldError id="accessibility-report-error">
          Enter a report name to create the preview.
        </FieldError>
      )}
      <Button type="submit">Create preview</Button>
      <p role="status" aria-atomic="true">
        {result}
      </p>
    </form>
  );
}

function KeyboardExample() {
  const [open, setOpen] = useState(false);
  return (
    <div class="accessibility-demo">
      <h3>Try a keyboard round trip</h3>
      <p>
        Tab to Open example dialog and press Enter. Tab to Example note, then
        press Escape and check that focus returns to the opening button.
      </p>
      <div class="catalog-row">
        <Button onClick={() => setOpen(true)}>Open example dialog</Button>
        <Tooltip text="You can reach this explanation with keyboard focus or a pointer. Press Escape to dismiss it.">
          <button type="button" class="rv-btn">
            About keyboard hints
          </button>
        </Tooltip>
      </div>
      <Dialog
        open={open}
        title="Keyboard navigation example"
        closeLabel="Close example dialog"
        onClose={() => setOpen(false)}
        footer={<Button onClick={() => setOpen(false)}>Done exploring</Button>}
      >
        <p>
          This dialog gives the current task a named surface. Its keyboard focus
          stays within the dialog until you close it.
        </p>
        <label htmlFor="accessibility-dialog-note">Example note</label>
        <TextInput id="accessibility-dialog-note" />
      </Dialog>
    </div>
  );
}

function TimelineExample() {
  const [rows, setRows] = useState<TimelineTrackItem<TimelineTrackEvent>[]>([
    {
      id: 'draft',
      event: {
        start: 8,
        end: 12,
        label: 'Report draft',
        color: '#2563eb',
        textColor: '#fff',
      },
    },
  ]);
  const event = rows[0].event;
  return (
    <div class="accessibility-demo">
      <h3>Try moving an event without dragging</h3>
      <p>
        Open Edit timeline events and choose Move later. The same event updates
        whether you use these commands, the arrow keys, or a pointer drag.
      </p>
      <TimelineTrack
        rows={rows}
        range={{ start: 0, end: 24 }}
        tooltip={false}
        labels={{ preview: 'Accessible timeline example' }}
        onSelect={() => {}}
        onEventChange={(id, next) =>
          setRows((current) =>
            current.map((row) =>
              row.id === id ? { ...row, event: next } : row,
            ),
          )
        }
      />
      <p role="status" aria-atomic="true">
        Report draft: {event.start}:00–{event.end}:00.
      </p>
    </div>
  );
}

export function AccessibilityPage() {
  return (
    <div class="accessibility-layout">
      <article
        class="accessibility-article"
        aria-labelledby="accessibility-title"
      >
        <header class="component-intro">
          <span class="home-eyebrow">REVO UI · ACCESSIBILITY GUIDE</span>
          <h1 id="accessibility-title">{accessibilityArticle.headline}</h1>
          <p class="accessibility-lead">
            A report should be easy to name. A calendar should be easy to
            navigate. A task should be possible to move without dragging. These
            small interactions determine whether an interface works for the
            person using it.
          </p>
          <p>
            Revo UI brings shared interaction patterns to financial dashboards,
            reporting tools and project workspaces across React, Vue, Angular,
            Svelte, Preact and TypeScript. This guide explains what to expect,
            lets you try the controls, and shows where your application
            completes the accessibility work.
          </p>
          <p class="accessibility-byline">
            By the Revo UI team · Published{' '}
            <time dateTime={accessibilityArticle.published}>
              10 November 2026
            </time>
          </p>
        </header>
        <PageContents items={sections} label="Accessibility guide contents" />
        <section aria-labelledby="everyday-access">
          <h2 id="everyday-access">
            Accessibility is part of everyday usability
          </h2>
          <p>
            People use business software with keyboards, touchscreens, screen
            magnifiers, speech input and screen readers. They also work in
            bright rooms, increase text size, and reduce animation. A consistent
            interface helps people keep their place and understand the result of
            an action.
          </p>
          <p>
            Our engineering target is the Level A and AA requirements of{' '}
            <a href="https://www.w3.org/TR/WCAG22/">WCAG 2.2</a>. The standard
            addresses how people perceive, operate and understand a complete
            page or process. A component library provides useful foundations;
            the finished application still needs its own validation.
          </p>
          <div class="accessibility-note">
            <strong>A clear standard, with transparent evidence.</strong>
            <p>
              We document implementation coverage and test results rather than
              treating an automated score as a certificate. Read the{' '}
              <a href="https://github.com/revolist/revo-ui/blob/main/ACCESSIBILITY.md">
                accessibility coverage record
              </a>{' '}
              for current scope, manual checks and integration responsibilities.
              Full WCAG conformance and complete screen-reader task validation
              have not been established.
            </p>
          </div>
        </section>

        <section aria-labelledby="keyboard-and-focus">
          <h2 id="keyboard-and-focus">Keep work moving with a keyboard</h2>
          <p>
            Visible focus answers a simple question: where will the next action
            happen? Shared controls provide focus styling, and composite widgets
            use their own keyboard patterns. Tab moves between controls; arrow
            keys move within supported menus, lists, calendars and other grouped
            controls. A focused control should remain understandable when a
            popup opens.
          </p>
          <p>
            Dialogs need an accessible title, a reachable close action and a way
            back to the task that opened them. Nested popups should dismiss one
            layer at a time. Tooltips should be reachable through focus as well
            as hover, allow pointer travel onto their content, and dismiss with
            Escape. Keep essential instructions visible outside a tooltip.
          </p>
          <KeyboardExample />
          <p>
            Explore{' '}
            <a href={componentHref('dialogs-and-floating-surfaces')}>
              dialogs and floating surfaces
            </a>
            , <a href={componentHref('tooltip')}>tooltips</a> and{' '}
            <a href={componentHref('calendar-and-dates')}>
              calendar keyboard behavior
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="labels-and-feedback">
          <h2 id="labels-and-feedback">
            Give every action a name and every error a next step
          </h2>
          <p>
            A placeholder disappears as soon as someone types. A visible label
            stays useful. Connect each field to its label, associate its help
            and error text, and expose invalid state when validation fails.
            Icon-only buttons need names that describe the action, such as
            Remove assignee, rather than the icon’s shape.
          </p>
          <p>
            Errors should identify the problem in text and explain how to
            recover. A red border alone cannot do that. Use status messages for
            routine results and urgent announcements sparingly; meaningful
            announcements matter more than announcing every keystroke.
          </p>
          <FeedbackExample />
          <p>
            See <a href={componentHref('inputs-and-forms')}>inputs and forms</a>{' '}
            and{' '}
            <a href={componentHref('status-and-feedback')}>
              status and feedback
            </a>{' '}
            for more examples. Supply translated visible labels, accessible
            names, instructions and errors together.
          </p>
        </section>

        <section aria-labelledby="alternatives-to-dragging">
          <h2 id="alternatives-to-dragging">
            Make direct manipulation optional
          </h2>
          <p>
            Dragging a small handle is difficult for many people. A keyboard
            shortcut helps, but a click or tap alternative also matters.
            TimelineTrack exposes an Edit timeline events disclosure with
            commands for moving an event and adjusting either endpoint. The
            commands update the same controlled event values as dragging.
          </p>
          <TimelineExample />
          <p>
            Short events and milestones retain larger interaction affordances
            inside the track. Field configurator examples also expose move
            actions. When you hide built-in commands or add your own drag
            interaction, provide an equivalent single-pointer action and
            validate target spacing in the final layout.
          </p>
          <p>
            Explore the{' '}
            <a href={componentHref('timeline-track')}>timeline track</a> and{' '}
            <a href={componentHref('field-configurators')}>
              field configurators
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="readable-interfaces">
          <h2 id="readable-interfaces">
            Design for larger text, different themes and less motion
          </h2>
          <p>
            Important information should survive a change in presentation.
            Calendar rows and timeline lanes can grow with text; narrow layouts
            should wrap content or keep genuinely two-dimensional data in a
            local scroll area. Test long names, translated dates and
            right-to-left layouts rather than relying on a short English label.
          </p>
          <p>
            Use the gallery’s Theme, Animations and Right to left controls to
            explore presentation changes. Shared styles include reduced-motion
            and forced-colors treatments. Browser emulation is useful test
            evidence, but does not replace checking actual platform settings.
          </p>
          <p>
            Use semantic text and surface colors, keep focus visible, and pair
            status colors with words or other recognizable cues. Custom brand
            colors, gradients, chart marks and disabled states need review in
            their real context. A palette preview alone cannot establish
            contrast across an application.
          </p>
          <p>
            Explore{' '}
            <a href={siteHref('colors/')}>semantic colors and palettes</a>. Try
            enlarging this page’s text and navigating its examples without a
            mouse.
          </p>
        </section>

        <section aria-labelledby="quality-and-testing">
          <h2 id="quality-and-testing">
            Quality means testing behavior, not just markup
          </h2>
          <p>
            We combine unit tests for control contracts with browser tests for
            focus, popup ownership, keyboard interaction, touch alternatives and
            layout. Accessibility scans exercise full component specimens and
            representative open, empty and invalid states across light and dark
            themes.
          </p>
          <p>
            Regression checks cover pointer travel to tooltips, immediate
            dropdown search, nested overlay dismissal, boundary timeline
            handles, and enlarged calendar text. Framework checks exercise
            shared controls through their adapters, including framework-owned
            content and cleanup.
          </p>
          <p>
            Automated scans can identify many semantic and contrast problems,
            but some results require human judgment. An incomplete result stays
            open for review. Screen-reader tasks, native zoom, custom-painted
            contrast and complete focus traversal remain explicit manual checks
            in the coverage record. Compatibility must be verified with the
            browser and assistive technology used by your audience.
          </p>
          <p>
            Use the{' '}
            <a href="https://www.w3.org/WAI/WCAG22/quickref/">
              W3C WCAG quick reference
            </a>{' '}
            to plan criterion-level checks and the{' '}
            <a href="https://www.w3.org/WAI/ARIA/apg/patterns/">
              ARIA Authoring Practices patterns
            </a>{' '}
            to understand widget behavior.
          </p>
        </section>

        <section aria-labelledby="integration-checklist">
          <h2 id="integration-checklist">Before you ship your application</h2>
          <ol>
            <li>
              <strong>Name the task.</strong> Check page titles, headings,
              landmarks, field labels and action names in the actual workflow.
            </li>
            <li>
              <strong>Walk the whole journey.</strong> Use keyboard-only
              navigation, including error recovery, nested popups, cancellation
              and focus return.
            </li>
            <li>
              <strong>Change the presentation.</strong> Check 200% text
              enlargement, 400% browser zoom, text spacing, long translations,
              right-to-left content and each supported theme.
            </li>
            <li>
              <strong>Use assistive technology.</strong> Test complete tasks
              with supported screen-reader/browser pairs, including asynchronous
              results and empty states.
            </li>
            <li>
              <strong>Review your content.</strong> Supply useful chart
              alternatives, accessible PDFs, clear instructions and non-color
              status cues. Validate authentication, time limits and
              consequential submissions in your own process.
            </li>
            <li>
              <strong>Keep the evidence current.</strong> Recheck custom
              renderers, styles and adapters after changes, and turn
              reproducible problems into regressions.
            </li>
          </ol>
        </section>

        <section aria-labelledby="accessibility-help">
          <h2 id="accessibility-help">Questions and accessibility feedback</h2>
          <h3>Does using Revo UI make my application WCAG compliant?</h3>
          <p>
            Conformance depends on the complete pages, content and processes you
            deliver. Shared components reduce repeated work, while your labels,
            custom content, styles and integration determine the final
            experience. Use the coverage record and test your application’s
            actual tasks.
          </p>
          <h3>Can I use the same approach across frameworks?</h3>
          <p>
            Yes. The <a href={siteHref('frameworks/')}>framework guides</a>{' '}
            explain the shared controls and adapter entry points. Each framework
            still needs integration tests for its content, state updates and
            lifecycle.
          </p>
          <h3>How do I report a barrier?</h3>
          <p>
            <a href="https://github.com/revolist/revo-ui/issues">
              Report an accessibility issue on GitHub
            </a>{' '}
            with the affected component, browser, operating system, assistive
            technology if used, and steps to reproduce. Explain what you
            expected, what happened and whether a workaround is available. Use a
            small example and remove private application data.
          </p>
        </section>
      </article>
    </div>
  );
}
