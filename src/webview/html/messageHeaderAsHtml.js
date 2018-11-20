/* @flow */
import template from './template';
import type { Message, Narrow, Outbox } from '../../types';
import type { BackgroundData } from '../MessageList';
import {
  isStreamNarrow,
  isTopicNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  streamNarrow,
  topicNarrow,
  privateNarrow,
  groupNarrow,
} from '../../utils/narrow';
import { foregroundColorFromBackground } from '../../utils/color';

export default (
  { ownEmail, subscriptions }: BackgroundData,
  narrow: Narrow,
  item: Message | Outbox | {||},
) => {
  if (!item.type) {
    return '';
  }

  if (isStreamNarrow(narrow)) {
    const topicNarrowStr = JSON.stringify(topicNarrow(item.display_recipient, item.subject));
    const topicHtml = item.match_subject || template`${item.subject}`;

    return template`
<div
  class="header-wrapper header topic-text"
  data-narrow="${topicNarrowStr}"
  data-msg-id="${item.id}"
>
  $!${topicHtml}
</div>
    `;
  }

  if (item.type === 'stream') {
    // Somehow, if `item.display_recipient` appears in the `find` callback,
    // Flow worries that `item` will turn out to be a {||} after all.
    const { display_recipient } = item;
    const stream = subscriptions.find(x => x.name === display_recipient);

    const backgroundColor = stream ? stream.color : '#ccc';
    const textColor = foregroundColorFromBackground(backgroundColor);
    const streamNarrowStr = JSON.stringify(streamNarrow(item.display_recipient));
    const topicNarrowStr = JSON.stringify(topicNarrow(item.display_recipient, item.subject));
    const topicHtml = item.match_subject || template`${item.subject}`;

    return template`
<div class="header-wrapper stream-header" data-msg-id="${item.id}">
  <div class="header stream-text"
       style="color: ${textColor};
              background: ${backgroundColor}"
       data-narrow="${streamNarrowStr}">
    # ${item.display_recipient}
  </div>
  <div class="header topic-text" data-narrow="${topicNarrowStr}">
    $!${topicHtml}
  </div>
</div>
    `;
  }

  if (
    item.type === 'private'
    && !isPrivateNarrow(narrow)
    && !isGroupNarrow(narrow)
    && !isTopicNarrow(narrow)
  ) {
    const recipients =
      item.display_recipient.length === 1 && item.display_recipient[0].email === ownEmail
        ? item.display_recipient
        : item.display_recipient.filter(r => r.email !== ownEmail);

    const narrowObj =
      recipients.length === 1
        ? privateNarrow(recipients[0].email)
        : groupNarrow(recipients.map(r => r.email));
    const privateNarrowStr = JSON.stringify(narrowObj);

    return template`
<div class="header-wrapper private-header header"
     data-narrow="${privateNarrowStr}"
     data-msg-id="${item.id}">
  ${recipients
    .map(r => r.full_name)
    .sort()
    .join(', ')}
</div>
    `;
  }

  return '';
};
