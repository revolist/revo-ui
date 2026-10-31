import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Listbox, ListboxOption, ListboxGroup } from '@revolist/ui/selection-list';
import { SvgIcon } from '@revolist/ui/icons/icon';
import numberIcon from '@fortawesome/fontawesome-free/svgs/solid/hashtag.svg?raw';
import userIcon from '@fortawesome/fontawesome-free/svgs/solid/user.svg?raw';
import sliders from '@fortawesome/fontawesome-free/svgs/solid/sliders.svg?raw';
import { Example } from './catalog';

export function SelectionListExamples() {
  const [view, setView] = useState('table');
  const [format, setFormat] = useState('number');
  const [visual, setVisual] = useState('none');
  return <Example title="Selection list">
    <Listbox label="Items" onSelect={setView}>
      {[{ value: 'table', label: 'Table' }, { value: 'board', label: 'Board' }, { value: 'calendar', label: 'Calendar', disabled: true }].map(option =>
        <ListboxOption key={option.value} value={option.value} selected={view === option.value} disabled={option.disabled} onClick={() => setView(option.value)}>{option.label}</ListboxOption>)}
    </Listbox>
    <div class="catalog-icon-lists">
      <Listbox label="Value formats" onSelect={setFormat}>
        {[{ value: 'automatic', label: 'Automatic', description: 'No specific format', icon: sliders }, { value: 'number', label: 'Number', description: '1,000.12', icon: numberIcon }].map(option =>
          <ListboxOption key={option.value} value={option.value} selected={format === option.value} onClick={() => setFormat(option.value)}
            label={option.label} description={option.description} icon={<SvgIcon svg={option.icon} />} />)}
      </Listbox>
      <Listbox label="Visual formats" onSelect={setVisual}>
        <ListboxOption value="none" selected={visual === 'none'} onClick={() => setVisual('none')} label="None" icon={<SvgIcon svg={sliders} />} />
        <ListboxGroup label="Identity">
          <ListboxOption value="avatar" selected={visual === 'avatar'} onClick={() => setVisual('avatar')} label="Avatar with text" icon={<SvgIcon svg={userIcon} />} />
        </ListboxGroup>
      </Listbox>
    </div>
  </Example>;
}
