import { h, render } from 'preact';
import { expect, it } from 'vitest';
import { AiAssistant, AiPromptInput, AiResult } from './components';
import { AiRequestTrail } from './request-trail';
import { AI_UI_MESSAGES, translateAiText } from './translations';
it('provides an English fallback for every UI message and interpolates after translation', () => {
  expect(new Set(AI_UI_MESSAGES).size).toBe(AI_UI_MESSAGES.length);
  for (const message of AI_UI_MESSAGES)
    expect(translateAiText(message)).toBe(message);
  expect(
    translateAiText(
      'Remove request: {label}',
      { 'Remove request: {label}': 'Supprimer : {label}' },
      { label: 'Europe {count}' },
    ),
  ).toBe('Supprimer : Europe {count}');
});
it('localizes shared controls, accessible labels, counts and hints through one provider', () => {
  const host = document.createElement('div');
  render(
    <AiAssistant
      translations={{
        'AI view assistant': 'Assistant',
        'Ask AI to change this view': 'Votre demande',
        'Filter or sort your data…': 'Filtrer…',
        Send: 'Envoyer',
        'Enter to send · Shift+Enter for a new line': 'Entrée pour envoyer',
        '{count} steps': '{count} étapes',
        'Request history': 'Historique',
        'View steps': 'Étapes',
        'Remove request: {label}': 'Supprimer : {label}',
        'Clear all': 'Tout effacer',
        '{count} matching rows': '{count} lignes',
      }}
    >
      <AiPromptInput
        value=""
        hint="Enter to send · Shift+Enter for a new line"
        onValueChange={() => {}}
        onSubmit={() => {}}
      />
      <AiRequestTrail
        items={[
          { id: '1', label: 'Europe' },
          { id: '2', label: 'Amount' },
        ]}
        onRemove={() => {}}
        onClear={() => {}}
      />
      <AiResult summary="OK" matchedRows={23} />
    </AiAssistant>,
    host,
  );
  expect(host.querySelector('textarea')?.placeholder).toBe('Filtrer…');
  expect(host.querySelector('label')?.textContent).toBe('Votre demande');
  expect(host.querySelector('[aria-label="Envoyer"]')).not.toBeNull();
  expect(host.textContent).toContain('Entrée pour envoyer');
  expect(host.querySelector('[aria-label="Historique"]')).not.toBeNull();
  expect(host.textContent).toContain('23 lignes');
  expect(
    host.querySelector('[aria-label="Supprimer : Europe"]'),
  ).not.toBeNull();
  expect(host.textContent).toContain('Tout effacer');
  render(null, host);
});
