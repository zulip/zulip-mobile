/* @flow */
import type { TimingItem } from '../types';

const timingMap = {};
const countMap = {};
const log: TimingItem[] = [];

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now() / 1000);

const add = (item: TimingItem) => {
  log.push(item);
};

const start = (key: string) => {
  timingMap[key] = now();
};

const startGroup = (key: string) => {
  timingMap[key] = now();
  if (countMap[key]) {
    countMap[key]++;
  } else {
    countMap[key] = 1;
  }
};

const end = (key: string) => {
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

const endGroup = (key: string) => {
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
