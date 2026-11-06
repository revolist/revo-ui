import './revo-ui-element';
import type { RevoUiElement } from './revo-ui-element';
import './style.css';

const messages = {
  en: {
    title: 'Report controls as Web Components',
    description: 'Revo UI controls mounted with a custom-element adapter.',
    field: 'Report name',
    initial: 'Monthly revenue',
    apply: 'Apply report',
    applied: (value: string) => `Selected report: ${value}`,
  },
  pt: {
    title: 'Controlos de relatórios com Web Components',
    description: 'Controlos Revo UI montados através de um adaptador de elementos personalizados.',
    field: 'Nome do relatório',
    initial: 'Receita mensal',
    apply: 'Aplicar relatório',
    applied: (value: string) => `Relatório selecionado: ${value}`,
  },
};
const language = new URLSearchParams(location.search).get('lang') === 'pt' ? 'pt' : 'en';
const labels = messages[language];
document.documentElement.lang = language;
document.getElementById('title')!.textContent = labels.title;
document.getElementById('description')!.textContent = labels.description;
document.getElementById('field-label')!.textContent = labels.field;

const input = document.querySelector<RevoUiElement>('#name')!;
input.props = { id: 'report-name', defaultValue: labels.initial };
const button = document.querySelector<RevoUiElement>('#apply')!;
button.props = { children: labels.apply, variant: 'primary' };
button.addEventListener('click', () => {
  document.getElementById('status')!.textContent =
    labels.applied(input.querySelector('input')!.value);
});
