/* @flow */
import type { TimingItem } from '../types';

const timingMap: Object = {};
const countMap: Object = {};
const log: TimingItem[] = [];

const now: () => number = () =>
  ((typeof performance !== 'undefined' ? performance.now() : Date.now() / 1000): number);

const add = (item: TimingItem): void => {
  log.push(item);
};

const start: (key: string) => void = (key: string): void => {
  timingMap[key] = now();
};

const startGroup: (key: string) => void = (key: string): void => {
  timingMap[key] = now();
  if (countMap[key]) {
    countMap[key]++;
  } else {
    countMap[key] = 1;
  }
};

const end: (key: string) => void = (key: string): void => {
  if (timingMap[key]) {
    add({
      text: key,
      start: timingMap[key],
      end: now(),
    });
    delete timingMap[key];
  } else {
    add({
      text: key,
      end: now(),
    });
  }
};

const endGroup: (key: string) => = (key: string) => {
  if (countMap[key] % 10 === 0) {
    end(key);
  }
};

export default {
  add,
  startGroup,
  start,
  end,
  endGroup,
  log,
};
