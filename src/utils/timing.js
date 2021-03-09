/* @flow strict-local */
import type { TimingItemType } from '../types';

const startMsMap: {| [string]: number |} = {};
const log: TimingItemType[] = [];

const add = (item: TimingItemType) => {
  log.push(item);
};

const start = (key: string) => {
  startMsMap[key] = Date.now();
};

const end = (key: string) => {
  if (startMsMap[key]) {
    add({
      text: key,
      startMs: startMsMap[key],
      endMs: Date.now(),
    });
    delete startMsMap[key];
  }
};

export default {
  add,
  start,
  end,
  log,
};
