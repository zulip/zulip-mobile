/* @flow */
import type { TimingItemType } from '../types';

const timingMap: { [string]: number } = {};
const log: TimingItemType[] = [];

const add = (item: TimingItemType) => {
  log.push(item);
};

const start = (key: string) => {
  timingMap[key] = Date.now();
};

const end = (key: string) => {
  if (timingMap[key]) {
    add({
      text: key,
      startMs: timingMap[key],
      endMs: Date.now(),
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
