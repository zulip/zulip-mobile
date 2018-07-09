/* @flow */
import type { TimingItemType } from '../types';

const timingMap: { [string]: number } = {};
const log: TimingItemType[] = [];

const now = (): number =>
  typeof performance !== 'undefined' ? performance.now() : Date.now() / 1000;

const add = (item: TimingItemType) => {
  log.push(item);
};

const start = (key: string) => {
  timingMap[key] = now();
};

const end = (key: string) => {
  if (timingMap[key]) {
    add({
      text: key,
      start: timingMap[key],
      end: now(),
    });
    delete timingMap[key];
  }
};

export default {
  add,
  start,
  end,
  log,
};
