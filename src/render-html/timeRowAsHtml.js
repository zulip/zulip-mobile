/* @flow */
import type { Message } from '../types';
import { humanDate } from '../utils/date';

export default (timestamp: number, nextMessage: Message) => `
  <div class="timerow" data-msg-id="${nextMessage.id}">
    <div class="timerow-left"></div>
    ${humanDate(new Date(timestamp * 1000))}
    <div class="timerow-right"></div>
  </div>
`;
