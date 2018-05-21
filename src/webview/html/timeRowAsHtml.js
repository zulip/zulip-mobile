/* @flow */
import escape from 'lodash.escape';
import type { Message } from '../../types';
import { humanDate } from '../../utils/date';

export default (timestamp: number, nextMessage: Message): string => `
  <div class="timerow" data-msg-id="${escape(nextMessage.id)}">
    <div class="timerow-left"></div>
    ${escape(humanDate(new Date(timestamp * 1000)))}
    <div class="timerow-right"></div>
  </div>
`;
