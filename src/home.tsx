import { componentHref, frameworkHref, siteHref } from './routing';
import { FrameworkLogo, frameworkLogos } from './framework-logos';
import { WeeklyPlanning } from './home-planning';
import { SliderField } from '@revolist/ui/filter/filters/slider/single';
import contact1 from './assets/people/contact-1.jpg';
import contact2 from './assets/people/contact-2.jpg';
import contact3 from './assets/people/contact-3.jpg';
import { FinancialWidgets } from './home-financials';
import { formatMoney as money } from './finance-data';
import { useState } from 'preact/hooks';
import {
  Badge,
  Button,
  FormField,
  NumberInput,
  ProgressBar,
  Avatar,
} from '@revolist/ui/preact';
import { Select } from '@revolist/ui/select';
import { AreaChart, BarChart } from '@revolist/ui/distribution-chart';
import { slug as sectionId } from './example-source';

const revenueValues = [
  18200, 22400, 19800, 28500, 26800, 31400, 29600, 36200, 34800, 41200, 38700,
  48290,
];
const annualRevenue = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
].map((month, index) => ({
  key: month,
  value: revenueValues[index],
  selected: true,
  tooltip: { title: month, details: [money(revenueValues[index])] },
}));
const expenses = ['Team', 'Software', 'Office', 'Other'].map(
  (category, index) => ({
    key: category,
    value: [6200, 2840, 2400, 1400][index],
    selected: true,
    tooltip: {
      title: category,
      details: [money([6200, 2840, 2400, 1400][index])],
    },
  }),
);
const transactions = [
  {
    name: 'Acme Studio',
    photo: contact1,
    initials: 'AS',
    detail: 'Invoice #1048 · Today',
    amount: 1850,
    status: 'completed',
  },
  {
    name: 'Cloud services',
    photo: contact2,
    initials: 'CS',
    detail: 'Infrastructure · Today',
    amount: -249,
    status: 'completed',
  },
  {
    name: 'Northstar Labs',
    photo: contact3,
    initials: 'NL',
    detail: 'Invoice #1047 · Yesterday',
    amount: 3200,
    status: 'pending',
  },
];

export interface GalleryStarText {
  introduction: string;
  description: string;
  action: string;
}

export const defaultGalleryStarText: GalleryStarText = {
  introduction: 'Revo UI is new here.',
  description: 'If it’s useful to you, a star helps others find it.',
  action: 'Star on GitHub',
};

export function GalleryHome({
  starText,
}: {
  starText?: Partial<GalleryStarText>;
} = {}) {
  const invitation = { ...defaultGalleryStarText, ...starText };
  const [period, setPeriod] = useState('6m');
  const [status, setStatus] = useState('all');
  const [saved, setSaved] = useState(14200);
  const [contribution, setContribution] = useState(500);
  const [added, setAdded] = useState(false);
  const revenue = period === '6m' ? annualRevenue.slice(6) : annualRevenue;
  const totalRevenue = revenue.reduce((total, item) => total + item.value, 0);
  return (
    <div class="gallery-home">
      <section class="home-hero">
        <span class="home-eyebrow">REVO UI · COMPONENT LIBRARY</span>
        <h1>
          Components for finance,
          <br />
          reporting, and projects.
        </h1>
        <p>
          Build financial apps, reporting dashboards, and project management
          tools.
          <br />
          Compose rich data views and everyday workflows with one shared UI
          library.
        </p>
        <div class="home-actions">
          <Button
            rounded
            variant="solid"
            className="home-primary"
            href={componentHref('buttons')}
          >
            Explore components
          </Button>
          <Button rounded className="home-secondary" href={siteHref('colors/')}>
            Discover the palette
          </Button>
        </div>
        <nav class="home-framework-links" aria-label="Supported frameworks">
          {Object.keys(frameworkLogos).map((name) => (
            <a class="home-framework-link" href="#frameworks">
              <FrameworkLogo name={name} />
              <span>{name}</span>
            </a>
          ))}
        </nav>
        <div class="home-meta">
          Accessible controls <span>·</span> Flexible composition <span>·</span>{' '}
          One shared system
        </div>
        <div class="home-star-invitation">
          <p class="home-star-copy">
            <strong>{invitation.introduction}</strong> {invitation.description}
          </p>
          <Button
            rounded
            className="home-star-link"
            href="https://github.com/revolist/revo-ui"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">☆</span>
            {invitation.action}
          </Button>
        </div>
      </section>
      <div class="home-showcase-heading">
        <h2>From financial insight to project progress.</h2>
        <span>Explore the components in action</span>
      </div>
      <div class="home-widgets">
        <div class="home-widget-stack">
          <article class="home-widget finance-revenue">
            <div class="widget-caption">
              <span>Revenue overview</span>
              <a href={componentHref('charts-and-range-selection')}>
                Area chart
              </a>
            </div>
            <div class="widget-between">
              <div>
                <h3>Total revenue</h3>
                <strong class="finance-amount">{money(totalRevenue)}</strong>
              </div>
              <Select
                aria-label="Reporting period"
                value={period}
                onValueChange={(value) => setPeriod(String(value))}
              >
                <option value="6m">Last 6 months</option>
                <option value="12m">Last 12 months</option>
              </Select>
            </div>
            <div class="catalog-row">
              <Badge variant="neutral">+24.8%</Badge>
              <span class="widget-footnote">revenue growth in December</span>
            </div>
            <AreaChart
              ariaLabel="Revenue over time"
              data={revenue}
              height={170}
              showGrid
              showLabels
              showPoints={false}
              areaFill="gradient"
              formatValue={money}
              tooltipIndicator="line"
            />
            <div class="widget-between finance-summary">
              <div>
                <span>Recurring</span>
                <strong>{money(totalRevenue * 0.76)}</strong>
              </div>
              <div>
                <span>One-time</span>
                <strong>{money(totalRevenue * 0.24)}</strong>
              </div>
            </div>
          </article>
          <article class="home-widget finance-spending">
            <div class="widget-caption">
              <span>Spending overview</span>
              <a href={componentHref('charts-and-range-selection')}>
                Bar chart
              </a>
            </div>
            <div class="widget-between">
              <div>
                <h3>Monthly expenses</h3>
                <strong class="finance-amount">$12,840.00</strong>
              </div>
              <Badge variant="neutral">Within budget</Badge>
            </div>
            <p>Your largest spending category is highlighted in orange.</p>
            <BarChart
              ariaLabel="Expenses by category"
              data={expenses}
              barColor={(datum) =>
                datum.value === Math.max(...expenses.map((item) => item.value))
                  ? '#f97316'
                  : undefined
              }
              height={170}
              showGrid
              showLabels
              formatValue={money}
              tooltipIndicator="dot"
            />
            <div class="widget-between finance-summary">
              <span>Monthly budget</span>
              <strong>$16,000.00</strong>
            </div>
            <ProgressBar value={80.25} ariaLabel="Monthly budget used" />
          </article>
        </div>
        <div class="home-widget-stack">
          <WeeklyPlanning controlsHref={componentHref('calendar-and-dates')} />
          <article class="home-widget finance-savings">
            <div class="widget-caption">
              <span>Savings goal</span>
              <a href={componentHref('sliders')}>Slider & inputs</a>
            </div>
            <div class="widget-between">
              <h3>A little closer to what's next.</h3>
            </div>
            <p>Build a reserve for your next big idea.</p>
            <div class="finance-goal-amount">
              <output class="finance-amount" aria-label="Savings balance">
                {money(saved)}
              </output>
              <span>of $20,000.00</span>
            </div>
            <SliderField
              label="Saved"
              layout="stacked"
              ariaLabel="Savings goal completion"
              min={0}
              max={20000}
              step={50}
              value={saved}
              valuePlacement="end"
              formatValue={(value) => `${Math.round((value / 20000) * 100)}%`}
              ariaValueText={`${money(saved)} of ${money(20000)}`}
              onChange={(value) => {
                setSaved(value);
                setAdded(false);
              }}
            />
            <FormField label="Contribution amount">
              <div class="finance-contribution">
                <NumberInput
                  aria-label="Savings contribution"
                  min={1}
                  max={Math.max(1, 20000 - saved)}
                  disabled={saved >= 20000}
                  value={contribution}
                  onValueChange={(value) => {
                    setContribution(value ?? 0);
                    setAdded(false);
                  }}
                />
                <Button
                  variant="solid"
                  disabled={contribution <= 0 || contribution > 20000 - saved}
                  onClick={() => {
                    setSaved(Math.min(20000, saved + contribution));
                    setAdded(true);
                  }}
                >
                  Add funds
                </Button>
              </div>
            </FormField>
            <p class="widget-footnote" role="status">
              {added
                ? 'Contribution added to this example.'
                : 'Try a contribution. This is an interactive example.'}
            </p>
          </article>
        </div>
      </div>
      <FinancialWidgets
        preview={
          <article class="home-widget finance-recent">
            <div class="widget-caption">
              <span>Recent transactions</span>
              <a href={componentHref('selects-chips-and-resources')}>
                Select & badges
              </a>
            </div>
            <div class="widget-between">
              <h3>A little more clarity.</h3>
              <Select
                aria-label="Transaction status"
                value={status}
                onValueChange={(value) => setStatus(String(value))}
              >
                <option value="all">All activity</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </Select>
            </div>
            <div class="finance-transactions" aria-label="Recent transactions">
              {transactions
                .filter((item) => status === 'all' || item.status === status)
                .map((item) => (
                  <div class="finance-transaction" key={item.name}>
                    <Avatar
                      value={item.photo}
                      label={`${item.name} contact`}
                      initials={item.initials}
                      size={32}
                    />
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.detail}</span>
                    </div>
                    <div class="finance-transaction-value">
                      <strong>
                        {item.amount > 0 ? '+' : '−'}
                        {money(Math.abs(item.amount))}
                      </strong>
                      <Badge variant="neutral">
                        {item.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
            <p class="widget-footnote">
              Sample activity for a clearer view of your cash flow.
            </p>
          </article>
        }
      />
      <section
        id="frameworks"
        class="home-frameworks"
        aria-labelledby="home-frameworks-title"
      >
        <div>
          <span class="home-eyebrow">YOUR FRAMEWORK. ONE SHARED SYSTEM.</span>
          <h2 id="home-frameworks-title">Fits the stack you already use.</h2>
          <p>
            Build financial apps, reporting dashboards, and project workspaces
            with the same components across frameworks. Keep your application
            state and workflows in your stack.
          </p>
          <Button rounded href={siteHref('frameworks/')}>
            Explore framework guides →
          </Button>
        </div>
        <div class="home-framework-grid">
          {[
            ['React', 'Named components, React state, and callbacks.'],
            ['Vue', 'Vue components, events, and slots.'],
            ['Angular', 'Standalone host with props and events.'],
            ['Svelte', 'Svelte 5 host with reactive props and snippets.'],
            ['Preact', 'Direct components with Preact hooks.'],
            ['Vanilla TypeScript', 'Mount, update, and dispose in the DOM.'],
          ].map(([name, description]) => (
            <a
              class="home-framework-card"
              href={frameworkHref(name.toLowerCase().replaceAll(' ', '-'))}
            >
              <strong>
                <span class="home-framework-name">
                  <FrameworkLogo name={name} />
                  {name}
                </span>
                <span aria-hidden="true">↗</span>
              </strong>
              <span>{description}</span>
            </a>
          ))}
        </div>
      </section>
      <section class="home-browse">
        <h2>Find your next building block</h2>
        <p>Start with a component. Build something that feels like you.</p>
        <div>
          {[
            'Charts and range selection',
            'Buttons',
            'Inputs and forms',
            'Selection controls',
            'Selects, chips and resources',
            'Calendar and dates',
            'Dialogs and floating surfaces',
          ].map((title) => (
            <Button rounded href={componentHref(sectionId(title))}>
              {title}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
