import { Dropdown } from '@revolist/ui/dropdown/index';
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Example } from './catalog';
import { PaginationPanel } from '@revolist/ui/native';
import { Pagination, FieldHint } from '@revolist/ui/preact';

export function PaginationExamples() {
  const [simple, setSimple] = useState(0),
    [compact, setCompact] = useState(0),
    [numbered, setNumbered] = useState(9),
    [selector, setSelector] = useState(0),
    [minimal, setMinimal] = useState(0),
    [minimalNavigation, setMinimalNavigation] = useState(0),
    [withoutBoundaries, setWithoutBoundaries] = useState(0),
    [last, setLast] = useState(9),
    [size, setSize] = useState(10),
    [table, setTable] = useState(0),
    [combined, setCombined] = useState(0);
  const panel = (
    page: number,
    onChange: (page: number) => void,
    options: Record<string, unknown> = {},
  ) =>
    new PaginationPanel(
      { itemsPerPage: 10, initialPage: page, total: 95, ...options },
      onChange,
      h,
    ).render();
  return (
    <>
      <Example title="Numbered pages" wide>
        <Pagination
          page={numbered}
          pageCount={20}
          onChange={setNumbered}
          variant="numbered"
          label="Numbered pages"
          previousLabel="Previous page"
          nextLabel="Next page"
        />
      </Example>
      <Example title="Page numbers only">
        <Pagination page={simple} pageCount={5} onChange={setSimple} variant="numbered" navigation={false} label="Simple page numbers" previousLabel="Previous simple page" nextLabel="Next simple page" />
      </Example>
      <Example title="Compact navigation">
        <Pagination
          page={compact}
          pageCount={5}
          onChange={setCompact}
          label="Result pages"
          previousLabel="Previous"
          nextLabel="Next"
        />
      </Example>
      <Example title="Page selector">{panel(selector, setSelector)}</Example>
      <Example title="Selector without navigation">
        {panel(minimal, setMinimal, { navigation: false })}
      </Example>
      <Example title="Navigation without summary">
        {panel(minimalNavigation, setMinimalNavigation, {
          info: false,
          totalInfo: false,
        })}
      </Example>
      <Example title="Navigation without first/last">
        {panel(withoutBoundaries, setWithoutBoundaries, { boundaryButtons: false, info: false, totalInfo: false })}
      </Example>
      <Example title="Pages and selector" wide>
        {panel(combined, setCombined, { buttonCount: 3 })}
      </Example>
      <Example title="Rows per page">
        <div class="rv-pagination-layout">
          <label>
            Rows per page
            <Dropdown className="rv-select" source={[{ value: '10', label: '10' }, { value: '25', label: '25' }, { value: '50', label: '50' }]}
              config={{ ariaLabel: "Rows per page" }}
              value={String(size)}
              onChange={(next) => {
                setSize(Number(String(next)));
                setTable(0);
              }}
             />
          </label>
          <Pagination
            page={table}
            pageCount={Math.ceil(95 / size)}
            onChange={setTable}
            variant="icons"
            label="Table pages"
            previousLabel="Previous table page"
            nextLabel="Next table page"
          />
          <FieldHint>
            Page {table + 1} of {Math.ceil(95 / size)}
          </FieldHint>
        </div>
      </Example>
      <Example title="Last page">{panel(last, setLast)}</Example>
      <Example title="Single page">{panel(0, () => {}, { total: 7 })}</Example>
      <Example title="Empty results">
        {panel(0, () => {}, { total: 0 })}
      </Example>
      <Example title="Disabled pagination">
        <Pagination
          page={2}
          pageCount={8}
          onChange={() => {}}
          disabled
          label="Disabled pages"
          previousLabel="Previous disabled page"
          nextLabel="Next disabled page"
        />
      </Example>
    </>
  );
}
