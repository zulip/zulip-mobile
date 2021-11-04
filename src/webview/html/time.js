/* @flow strict-local */
import template from './template';
import type { TimeMessageListElement } from '../../types';
import { humanDate } from '../../utils/date';

/**
 * The HTML string for a message-list element of the "time" type.
 *
 * This is a private helper of messageListElementHtml.
 */
export default (element: TimeMessageListElement): string => template`
  <div class="msglist-element timerow" data-msg-id="${element.subsequentMessage.id}">
    <div class="timerow-left"></div>
    ${humanDate(new Date(element.timestamp * 1000))}
    <div class="timerow-right"></div>
  </div>
`;
