import plusIcon from '@fortawesome/fontawesome-free/svgs/solid/plus.svg?raw';
import measureIcon from '@fortawesome/fontawesome-free/svgs/solid/calculator.svg?raw';
import rowsIcon from '@fortawesome/fontawesome-free/svgs/solid/bars.svg?raw';
import dollarIcon from '@fortawesome/fontawesome-free/svgs/solid/dollar-sign.svg?raw';
import numberIcon from '@fortawesome/fontawesome-free/svgs/solid/hashtag.svg?raw';
import swapIcon from '@fortawesome/fontawesome-free/svgs/solid/right-left.svg?raw';
import gearIcon from '@fortawesome/fontawesome-free/svgs/solid/gear.svg?raw';
import { h } from 'preact';
import { useState } from 'preact/hooks';
import {
  FieldRemoveButton,
  useFieldReorder,
  SelectedField,
  FieldActions,
  FieldStatusBadge,
  FieldList,
  FieldItem,
  FieldContent,
  FieldGroup,
  FieldIcon,
} from '@revolist/ui/field-configurator';
import { Button, Checkbox } from '@revolist/ui/preact';
import { Example } from './catalog';
import textIcon from '@fortawesome/fontawesome-free/svgs/solid/font.svg?raw';
export function FieldConfiguratorExamples() {
  const [measures, setMeasures] = useState(['Revenue (USD)']);
  const [areas, setAreas] = useState<Record<string, string[]>>({
    Fields: ['Country', 'Revenue (USD)', 'Year', 'Category'],
  });
  const reorder = useFieldReorder(areas.Fields, (next) =>
    setAreas({ Fields: next }),
  );
  const [configured, setConfigured] = useState<Record<string, boolean>>({
    Year: true,
    'Revenue (USD)': true,
  });
  return (
    <>
      <Example title="Selected field group">
        {Object.entries(areas).map(([area, fields]) => (
          <FieldGroup
            {...reorder.list}
            key={area}
            heading={
              <>
                <FieldIcon svg={rowsIcon} />
                {area}
              </>
            }
            aria-label={`Pivot selected ${area.toLowerCase()}`}
            actions={
              <FieldActions>
                <Button
                  className="rv-configurator-action-button"
                  variant="ghost"
                  size="compact"
                  aria-label="Reverse sample Fields"
                  onClick={() =>
                    setAreas({
                      ...areas,
                      [area]: [...fields].reverse(),
                    })
                  }
                >
                  <FieldIcon svg={swapIcon} />
                </Button>
                <Button
                  className="rv-configurator-action-button"
                  variant="ghost"
                  size="compact"
                  aria-label={`Add sample ${area}`}
                  onClick={() =>
                    setAreas({
                      ...areas,
                      [area]: [...fields, `Field ${fields.length + 1}`],
                    })
                  }
                >
                  <FieldIcon svg={plusIcon} />
                </Button>
                <FieldRemoveButton
                  locale={{
                    ariaLabel: `Clear sample ${area}`,
                    title: `Clear sample ${area}`,
                  }}
                  onClick={() => setAreas({ ...areas, [area]: [] })}
                  disabled={!fields.length}
                />
              </FieldActions>
            }
          >
            <FieldList {...reorder.list} empty={!fields.length} placeholder="Drop fields here">
              {fields.map((field, index) => (
                <SelectedField
                  key={field}
                  label={field}
                  icon={
                    <FieldIcon
                      svg={
                        field === 'Revenue (USD)'
                          ? dollarIcon
                          : field === 'Year'
                            ? numberIcon
                            : textIcon
                      }
                    />
                  }
                  {...reorder.row(index)}
                  actions={
                    <FieldActions>
                      {field !== 'Country' && (
                        <FieldStatusBadge
                          label={
                            field === 'Revenue (USD)'
                              ? 'Sum aggregation'
                              : configured[field]
                                ? 'Include 1 value'
                                : 'All values'
                          }
                          active={configured[field]}
                        >
                          {field === 'Revenue (USD)'
                            ? 'SUM'
                            : configured[field]
                              ? 'IN 1'
                              : 'ALL'}
                        </FieldStatusBadge>
                      )}
                      <Button
                        className="rv-configurator-action-button"
                        variant="ghost"
                        size="compact"
                        aria-label={`Configure sample ${area} ${field}`}
                        data-configurator-action="settings"
                        data-configured={configured[field] ? 'true' : undefined}
                        onClick={() =>
                          setConfigured({
                            ...configured,
                            [field]: !configured[field],
                          })
                        }
                      >
                        <FieldIcon svg={gearIcon} />
                      </Button>
                      <FieldRemoveButton
                        locale={{
                          ariaLabel: `Remove sample ${area} ${field}`,
                          title: `Remove sample ${area} ${field}`,
                        }}
                        onClick={() =>
                          setAreas({
                            ...areas,
                            [area]: fields.filter((value) => value !== field),
                          })
                        }
                      />
                    </FieldActions>
                  }
                />
              ))}
            </FieldList>
          </FieldGroup>
        ))}
      </Example>
      <Example title="Selectable measures">
        <FieldGroup
          heading={
            <>
              <FieldIcon svg={measureIcon} />
              Measures
            </>
          }
          aria-label="Selected measures"
        >
          <div class="catalog-field-stack">
            {['Revenue (USD)', 'Order count'].map((label) => (
              <FieldItem key={label}>
                <Checkbox
                  label={
                    <FieldContent icon={<FieldIcon svg={measureIcon} />}>
                      {label}
                    </FieldContent>
                  }
                  checked={measures.includes(label)}
                  onChange={(checked) =>
                    setMeasures(
                      checked
                        ? [...measures, label]
                        : measures.filter((item) => item !== label),
                    )
                  }
                />
              </FieldItem>
            ))}
          </div>
        </FieldGroup>
      </Example>
    </>
  );
}
