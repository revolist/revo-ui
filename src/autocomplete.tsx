import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Combobox, MultiSelect } from '@revolist/ui/preact';
import type { DropdownOption } from '@revolist/ui/dropdown/index';
import { Example } from './catalog';

const views = [
  { value: 'table', label: 'Table' },
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar', disabled: true },
];
const initialSkills = ['TypeScript', 'React', 'Vue'].map((label) => ({
  value: label,
  label,
}));
const createSkill = (label: string): DropdownOption<string> => ({
  value: label,
  label,
});

export function AutocompleteExamples() {
  const [view, setView] = useState<string>();
  const [skills, setSkills] = useState<string[]>(['TypeScript']);
  const [skillOptions, setSkillOptions] = useState(initialSkills);
  return (
    <>
      <Example title="Autocomplete input">
        <Combobox
          source={views}
          value={view}
          onChange={(next) => setView(Array.isArray(next) ? next[0] : next)}
          placeholder="Type to find a view…"
          config={{ ariaLabel: 'Autocomplete view', autocomplete: true }}
        />
        <output aria-label="Selected autocomplete view">
          {view ?? 'No selection'}
        </output>
      </Example>
      <Example title="Editable tags">
        <MultiSelect
          source={skillOptions}
          value={skills}
          onChange={(next) => setSkills(Array.isArray(next) ? next : [next])}
          onCreateOption={(option) =>
            setSkillOptions((current) => [...current, option])
          }
          placeholder="Type a skill…"
          config={{ ariaLabel: 'Skills', tags: createSkill }}
        />
        <output aria-label="Selected skills">{skills.join(', ')}</output>
      </Example>
    </>
  );
}
