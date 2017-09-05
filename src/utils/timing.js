/* @flow */
import { TimingItem } from '../types';

const timingMap = {};
const log: TimingItem[] = [];

const start = (key: string) => {
  timingMap[key] = Date.now();
};

const end = (key: string) => {
  if (timingMap[key]) {
    log.push({
      text: key,
      start: timingMap[key],
      end: Date.now(),
    });
    delete timingMap[key];
  } else {
    log.push({
      text: key,
      end: Date.now(),
    });
  }
};

export default {
  start,
  end,
  log,
};
