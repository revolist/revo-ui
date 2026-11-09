// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
import {
  getUiMotionDuration,
  inheritUiMotion,
  isUiMotionEnabled,
} from './motion';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute('data-rv-ui-motion');
  document.documentElement.style.removeProperty('--rv-ui-motion-enabled');
  vi.restoreAllMocks();
});

it('honors subtree/global opt-out, CSS policy and OS reduced motion', () => {
  const parent = document.createElement('section'),
    child = document.createElement('button');
  parent.append(child);
  document.body.append(parent);
  expect(isUiMotionEnabled(child)).toBe(true);
  parent.dataset.rvUiMotion = 'off';
  expect(isUiMotionEnabled(child)).toBe(false);
  parent.removeAttribute('data-rv-ui-motion');
  document.documentElement.dataset.rvUiMotion = 'off';
  expect(isUiMotionEnabled(child)).toBe(false);
  document.documentElement.removeAttribute('data-rv-ui-motion');
  child.style.setProperty('--rv-ui-motion-enabled', '0');
  expect(isUiMotionEnabled(child)).toBe(false);
  child.style.removeProperty('--rv-ui-motion-enabled');
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: true,
  } as MediaQueryList);
  expect(isUiMotionEnabled(child)).toBe(false);
});

it('reads shared timings and accepts seconds or milliseconds', () => {
  const element = document.createElement('div');
  document.body.append(element);
  expect(getUiMotionDuration(element, 'enter', 180)).toBe(180);
  element.style.setProperty('--rv-ui-motion-enter', '0.2s');
  expect(getUiMotionDuration(element, 'enter', 180)).toBe(200);
  element.style.setProperty('--rv-ui-motion-enter', '.125s');
  expect(getUiMotionDuration(element, 'enter', 180)).toBe(125);
  element.style.setProperty('--rv-ui-motion-enter', '0ms');
  expect(getUiMotionDuration(element, 'enter', 180)).toBe(0);
});

it('updates a body portal when the opener subtree policy changes and restores metadata on cleanup', async () => {
  const region = document.createElement('section'),
    opener = document.createElement('button'),
    portal = document.createElement('div');
  region.append(opener);
  document.body.append(region, portal);
  const cleanup = inheritUiMotion(opener, portal);
  expect(portal.hasAttribute('data-rv-ui-motion')).toBe(false);
  region.dataset.rvUiMotion = 'off';
  await flush();
  expect(portal.dataset.rvUiMotion).toBe('off');
  region.removeAttribute('data-rv-ui-motion');
  await flush();
  expect(portal.hasAttribute('data-rv-ui-motion')).toBe(false);
  cleanup();
  region.dataset.rvUiMotion = 'off';
  await flush();
  expect(portal.hasAttribute('data-rv-ui-motion')).toBe(false);
});

it('preserves an explicit destination opt-out and ignores absent sources', () => {
  const opener = document.createElement('button'),
    portal = document.createElement('div');
  portal.dataset.rvUiMotion = 'off';
  document.body.append(opener, portal);
  const cleanup = inheritUiMotion(opener, portal);
  cleanup();
  expect(portal.dataset.rvUiMotion).toBe('off');
  const noSource = inheritUiMotion(null, portal);
  portal.removeAttribute('data-rv-ui-motion');
  noSource();
  expect(portal.hasAttribute('data-rv-ui-motion')).toBe(false);
});

it('detects a disabled region across a shadow boundary', () => {
  const host = document.createElement('div');
  host.dataset.rvUiMotion = 'off';
  const child = document.createElement('button');
  host.attachShadow({ mode: 'open' }).append(child);
  document.body.append(host);
  expect(isUiMotionEnabled(child)).toBe(false);
});
