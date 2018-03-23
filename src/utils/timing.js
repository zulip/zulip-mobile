/* @flow */
import type { TimingItemType } from '../types';

const timingMap = {};
const countMap = {};
const log: TimingItemType[] = [];

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now() / 1000);

const add = (item: TimingItemType) => {
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
