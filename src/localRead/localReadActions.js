/* @flow */
import { MARK_MESSAGE_AS_READ_LOCALLY } from '../actionConstants';

export const markMessageAsLocallyRead = (messages: []) => ({
  type: MARK_MESSAGE_AS_READ_LOCALLY,
  messages,
  flag: 'read',
  operation: 'add',
});
