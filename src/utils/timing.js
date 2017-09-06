/* @flow */
import { TimingItem } from '../types';

const timingMap = {};
const log: TimingItem[] = [];

const add = (item: TimingItem) => {
  log.push(item);
};

const start = (key: string) => {
  timingMap[key] = Date.now();
};

const end = (key: string) => {
  if (timingMap[key]) {
    add({
      text: key,
      start: timingMap[key],
      end: Date.now(),
    });
    delete timingMap[key];
  } else {
    add({
      text: key,
      end: Date.now(),
    });
  }
};

export default {
  add,
  start,
  end,
  log,
};
