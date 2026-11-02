import { componentHref } from './routing';
import { h, type ComponentChildren } from 'preact';
import { renderProgressLine } from '@revolist/ui/native';
import { useMemo, useState } from 'preact/hooks';
import { Badge, Button, Checkbox, SearchInput } from '@revolist/ui/preact';
import { Select } from '@revolist/ui/select';
import { formatMoney as money } from './finance-data';

const allocations = {
  balanced: [50, 30, 20],
  growth: [70, 20, 10],
  conservative: [30, 45, 25],
} as const;
const invoices = [
  { id: 'INV-1051', name: 'Studio North', due: 'Due Nov 4', amount: 2400 },
  { id: 'INV-1052', name: 'Orbit Design', due: 'Due Nov 8', amount: 1850 },
  { id: 'INV-1053', name: 'Forma Collective', due: 'Due Nov 12', amount: 3200 },
];
export function FinancialWidgets({ preview }: { preview: ComponentChildren }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('due');
  const [allocation, setAllocation] =
    useState<keyof typeof allocations>('balanced');
  const [selected, setSelected] = useState<string[]>([]);
  const [paid, setPaid] = useState<string[]>([]);
  const [settled, setSettled] = useState(0);
  const portfolio = useMemo(
    () =>
      ['Equities', 'Bonds', 'Cash'].map((asset, index) => ({
        asset,
        value: (42000 * allocations[allocation][index]) / 100,
        weight: allocations[allocation][index],
        change: [4.8, 1.6, 0.2][index],
      })),
    [allocation],
  );
  const visibleInvoices = invoices
    .filter((item) =>
      `${item.name} ${item.id}`.toLowerCase().includes(query.toLowerCase()),
    )
    .toSorted((a, b) =>
      sort === 'amount' ? b.amount - a.amount : a.id.localeCompare(b.id),
    );
  const outstanding = invoices
    .filter((item) => !paid.includes(item.id))
    .reduce((sum, item) => sum + item.amount, 0);
  const selectedAmount = invoices
    .filter((item) => selected.includes(item.id))
    .reduce((sum, item) => sum + item.amount, 0);
  return (
    <div class="home-widgets home-extra-widgets finance-detailed-grid">
      {preview}
      <article class="home-widget finance-allocation">
        <div class="widget-caption">
          <span>Portfolio breakdown</span>
          <a href={componentHref('charts-and-range-selection')}>Charts & data presentation</a>
        </div>
        <div class="widget-between">
          <div>
            <h3>A place for every dollar.</h3>
            <strong class="finance-amount">$42,000.00</strong>
          </div>
          <Badge variant="neutral">3 asset classes</Badge>
        </div>
        <Select
          aria-label="Allocation profile"
          value={allocation}
          onValueChange={(value) =>
            setAllocation(value as keyof typeof allocations)
          }
        >
          <option value="balanced">Balanced</option>
          <option value="growth">Growth</option>
          <option value="conservative">Conservative</option>
        </Select>
        <div class="finance-table-scroll" role="region" aria-label="Asset allocation" tabIndex={0}>
          <table class="finance-detail-table">
            <caption class="finance-visually-hidden">
              Portfolio holdings
            </caption>
            <thead>
              <tr>
                <th scope="col">Asset class</th>
                <th scope="col">Market value</th>
                <th scope="col">Weight</th>
                <th scope="col">Return</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item) => (
                <tr key={item.asset}>
                  <th scope="row">{item.asset}</th>
                  <td>{money(item.value)}</td>
                  <td>
                    {renderProgressLine(h, {
                      percent: item.weight,
                      label: `${item.weight}%`,
                    })}
                  </td>
                  <td>+{item.change}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p class="widget-footnote">
          Sample allocation profiles and illustrative returns.
        </p>
      </article>
      <article class="home-widget finance-invoices finance-wide-widget">
        <div class="widget-caption">
          <span>Accounts receivable</span>
          <a href={componentHref('selection-controls')}>Selection & actions</a>
        </div>
        <div class="widget-between">
          <div>
            <h3>Outstanding invoices</h3>
            <output
              class="finance-amount"
              aria-label="Outstanding invoice total"
            >
              {money(outstanding)}
            </output>
          </div>
          <Badge variant="neutral">{invoices.length - paid.length} open</Badge>
        </div>
        <div class="finance-table-filters">
          <SearchInput
            aria-label="Search invoices"
            placeholder="Search client or invoice…"
            value={query}
            onInput={(event) => setQuery(event.currentTarget.value)}
          />
          <Select
            aria-label="Sort invoices"
            value={sort}
            onValueChange={(value) => setSort(String(value))}
          >
            <option value="due">Due date</option>
            <option value="amount">Amount: high to low</option>
          </Select>
        </div>
        <div class="finance-table-scroll">
          <table class="finance-detail-table">
            <caption class="finance-visually-hidden">Invoice details</caption>
            <thead>
              <tr>
                <th scope="col">Select</th>
                <th scope="col">Invoice</th>
                <th scope="col">Client</th>
                <th scope="col">Due date</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleInvoices.map((item) => (
                <tr key={item.id} data-selected={selected.includes(item.id)}>
                  <td>
                    <Checkbox
                      label={`Select ${item.id}`}
                      checked={selected.includes(item.id)}
                      disabled={paid.includes(item.id)}
                      onChange={(checked) =>
                        setSelected((current) =>
                          checked
                            ? [...current, item.id]
                            : current.filter((id) => id !== item.id),
                        )
                      }
                    />
                  </td>
                  <th scope="row">{item.id}</th>
                  <td>{item.name}</td>
                  <td>{item.due.replace('Due ', '')}</td>
                  <td>{money(item.amount)}</td>
                  <td>
                    <Badge variant="neutral">
                      {paid.includes(item.id) ? 'Paid' : 'Awaiting payment'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleInvoices.length && (
            <p class="widget-footnote" role="status">
              No matching invoices.
            </p>
          )}
        </div>
        <div class="widget-between finance-summary">
          <span>
            {selected.length} selected · {money(selectedAmount)}
          </span>
          <Button
            variant="solid"
            disabled={!selected.length}
            onClick={() => {
              setPaid((current) => [...current, ...selected]);
              setSettled(selected.length);
              setSelected([]);
            }}
          >
            Mark as paid
          </Button>
        </div>
        <p class="widget-footnote" role="status">
          {settled
            ? `${settled} ${settled === 1 ? 'invoice marked' : 'invoices marked'} as paid in this example.`
            : 'Select invoices to explore bulk payment states.'}
        </p>
      </article>
    </div>
  );
}
