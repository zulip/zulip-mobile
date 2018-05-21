/* @flow */
import escape from 'lodash.escape';
import type { Auth, Message, Narrow, Subscription } from '../../types';
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

export default ({
  item,
  subscriptions,
  auth,
  narrow,
}: {
  auth: Auth,
  item: Message,
  subscriptions: Subscription[],
  narrow: Narrow,
}) => {
  if (Object.keys(item).length === 0) {
    return '';
  }

  if (isStreamNarrow(narrow)) {
    const topicNarrowStr = JSON.stringify(topicNarrow(item.display_recipient, item.subject));

    return `
<div
  class="header-wrapper header topic-text"
  data-narrow="${escape(topicNarrowStr)}"
  data-msg-id="${escape(item.id)}"
>
  ${escape(item.match_subject || item.subject)}
</div>
    `;
  }

  if (item.type === 'stream') {
    const stream = subscriptions.find(x => x.name === item.display_recipient);

    const backgroundColor = stream ? stream.color : '#ccc';
    const textColor = foregroundColorFromBackground(backgroundColor);
    const streamNarrowStr = JSON.stringify(streamNarrow(item.display_recipient));
    const topicNarrowStr = JSON.stringify(topicNarrow(item.display_recipient, item.subject));

    return `
<div class="header-wrapper stream-header" data-msg-id="${escape(item.id)}">
  <div class="header stream-text"
       style="color: ${escape(textColor)};
              background: ${escape(backgroundColor)}"
       data-narrow="${escape(streamNarrowStr)}">
    # ${escape(item.display_recipient)}
  </div>
  <div class="header topic-text" data-narrow="${escape(topicNarrowStr)}">
    ${escape(item.match_subject || item.subject)}
  </div>
</div>
    `;
  }

  if (
    item.type === 'private' &&
    !isPrivateNarrow(narrow) &&
    !isGroupNarrow(narrow) &&
    !isTopicNarrow(narrow)
  ) {
    const recipients =
      item.display_recipient.length === 1 && item.display_recipient[0].email === auth.email
        ? item.display_recipient
        : item.display_recipient.filter(r => r.email !== auth.email);

    const narrowObj =
      recipients.length === 1
        ? privateNarrow(recipients[0].email)
        : groupNarrow(recipients.map(r => r.email));
    const privateNarrowStr = JSON.stringify(narrowObj);

    return `
<div class="header-wrapper private-header header"
     data-narrow="${escape(privateNarrowStr)}"
     data-msg-id="${escape(item.id)}">
  ${escape(
    recipients
      .map(r => r.full_name)
      .sort()
      .join(', '),
  )}
</div>
    `;
  }

  return '';
};
