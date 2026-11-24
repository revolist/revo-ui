import { h, render } from 'preact';
import { DatePicker } from '../../../../package/pickers';
import '../../../../package/styles.scss';
import { createCalendarField } from '../../../../package/calendar/date-field-native';
render(
  <dialog open>
    <section
      dir="rtl"
      data-theme="dark"
      style={{ '--calendar-scope-color': 'rgb(1, 2, 3)' }}
    >
      <DatePicker label="Date" openLabel="Open date" />
    </section>
  </dialog>,
  document.getElementById('app')!,
);

const fieldset = document.createElement('fieldset');
fieldset.append(
  createCalendarField(document, {
    label: 'Visit',
    openLabel: 'Open visit',
    value: '2026-10-12',
  }),
);
document.body.append(fieldset);
const disable = document.createElement('button');
disable.textContent = 'Disable fieldset';
disable.onclick = () => {
  fieldset.disabled = true;
};
document.body.append(disable);
const shadowHost = document.createElement('div');
document.querySelector('dialog')!.append(shadowHost);
const shadow = shadowHost.attachShadow({ mode: 'open' });
const scope = document.createElement('section');
scope.dir = 'rtl';
scope.style.setProperty('--calendar-scope-color', 'rgb(4, 5, 6)');
shadow.append(scope);
render(<DatePicker label="Shadow date" openLabel="Open shadow date" />, scope);
const modal = document.createElement('dialog');
modal.id = 'native-shadow-modal';
const nativeHost = document.createElement('div');
const nativeShadow = nativeHost.attachShadow({ mode: 'open' });
nativeShadow.append(
  createCalendarField(document, {
    label: 'Shadow visit',
    openLabel: 'Open shadow visit',
    value: '2026-10-12',
  }),
);
modal.append(nativeHost);
document.body.append(modal);
