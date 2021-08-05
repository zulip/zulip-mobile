/* @flow strict-local */

import { restore } from '../boot/store';

const replyTask = async (taskData: { ... }): Promise<void> => {
  restore(() => {
    // TODO implement Reply logic
  });
};

const replyTaskProvider = () => replyTask;

export default replyTaskProvider;
