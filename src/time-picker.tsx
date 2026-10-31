import { h } from 'preact';
import { useState } from 'preact/hooks';
import { DateTimeField } from '@revolist/ui/date-time';
import { Example } from './catalog';

export function TimePickerExamples() {
  const [appointment, setAppointment] = useState('09:10');
  const [seconds, setSeconds] = useState('13:45:23');
  const [confirmed, setConfirmed] = useState('14:30');
  return <Example title="Time picker options">
    <div>Business hours<DateTimeField kind="time" aria-label="Business hours" value={appointment} onValueChange={setAppointment}
      picker={{ timeFormat: '24h', minTime: '09:10', maxTime: '17:00', timeStep: 900, text: { chooseTime: 'Choose business time' } }} /></div>
    <small>09:10–17:00, in 15-minute intervals.</small>
    <div>12-hour clock with seconds<DateTimeField kind="time" aria-label="Time with seconds" value={seconds} onValueChange={setSeconds}
      picker={{ timeFormat: '12h', precision: 'second', calendar: { locale: 'en-US' }, text: { chooseTime: 'Choose precise time' } }} /></div>
    <div>Explicit confirmation<DateTimeField kind="time" aria-label="Confirm time" value={confirmed} onValueChange={setConfirmed}
      picker={{ timeFormat: '24h', autoApply: false, text: { chooseTime: 'Choose confirmed time' } }} /></div>
  </Example>;
}
