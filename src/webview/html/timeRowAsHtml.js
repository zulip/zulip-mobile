/* @flow strict-local */
import template from './template';
import type { Message, Outbox } from '../../types';
import { humanDate } from '../../utils/date';

export default (timestamp: number, nextMessage: Message | Outbox): string => template`
  <div class="timerow" data-msg-id="${nextMessage.id}">
    <span class="date-pill">${humanDate(new Date(timestamp * 1000))}</span>
  </div>
`;
