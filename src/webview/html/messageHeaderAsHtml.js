/* @flow strict-local */
import template from './template';
import type { Message, Narrow, Outbox } from '../../types';
import type { BackgroundData } from '../MessageList';
import {
  streamNarrow,
  topicNarrow,
  pmNarrowFromEmail,
  pmNarrowFromEmails,
  caseNarrow,
} from '../../utils/narrow';
import { foregroundColorFromBackground } from '../../utils/color';
import { humanDate } from '../../utils/date';
import {
  pmUiRecipientsFromMessage,
  pmKeyRecipientsFromMessage,
  streamNameOfStreamMessage,
} from '../../utils/recipient';

const renderSubject = item =>
  // TODO: pin down if '' happens, and what its proper semantics are.
  item.match_subject !== undefined && item.match_subject !== ''
    ? item.match_subject
    : template`${item.subject}`;

export default (
  { ownUser, subscriptions }: BackgroundData,
  narrow: Narrow,
  item: Message | Outbox | {||},
) => {
  type HeaderStyle = 'none' | 'topic+date' | 'full';
  const headerStyle: HeaderStyle = caseNarrow(narrow, {
    stream: () => 'topic+date',
    topic: () => 'none',

    pm: () => 'none',
    groupPm: () => 'none',

    home: () => 'full',
    starred: () => 'full',
    mentioned: () => 'full',
    allPrivate: () => 'full',
    search: () => 'full',
  });

  if (!item.type) {
    return '';
  }

  if (item.type === 'stream' && headerStyle === 'topic+date') {
    const streamName = streamNameOfStreamMessage(item);
    const topicNarrowStr = JSON.stringify(topicNarrow(streamName, item.subject));
    const topicHtml = renderSubject(item);

    return template`
<div
  class="header-wrapper header topic-header"
  data-narrow="${topicNarrowStr}"
  data-msg-id="${item.id}"
>
  <div class="topic-text">$!${topicHtml}</div>
  <div class="topic-date">${humanDate(new Date(item.timestamp * 1000))}</div>
</div>
    `;
  }

  if (item.type === 'stream' && headerStyle === 'full') {
    const streamName = streamNameOfStreamMessage(item);
    const stream = subscriptions.find(x => x.name === streamName);

    const backgroundColor = stream ? stream.color : 'hsl(0, 0%, 80%)';
    const textColor = foregroundColorFromBackground(backgroundColor);
    const streamNarrowStr = JSON.stringify(streamNarrow(streamName));
    const topicNarrowStr = JSON.stringify(topicNarrow(streamName, item.subject));
    const topicHtml = renderSubject(item);

    return template`
<div class="header-wrapper header stream-header topic-header"
    data-msg-id="${item.id}"
    data-narrow="${topicNarrowStr}">
  <div class="header stream-text"
       style="color: ${textColor};
              background: ${backgroundColor}"
       data-narrow="${streamNarrowStr}">
    # ${streamName}
  </div>
  <div class="topic-text">$!${topicHtml}</div>
  <div class="topic-date">${humanDate(new Date(item.timestamp * 1000))}</div>
</div>
    `;
  }

  if (item.type === 'private' && headerStyle === 'full') {
    const keyRecipients = pmKeyRecipientsFromMessage(item, ownUser);
    const narrowObj =
      keyRecipients.length === 1
        ? pmNarrowFromEmail(keyRecipients[0].email)
        : pmNarrowFromEmails(keyRecipients.map(r => r.email));
    const privateNarrowStr = JSON.stringify(narrowObj);

    const uiRecipients = pmUiRecipientsFromMessage(item, ownUser);
    return template`
<div class="header-wrapper private-header header"
     data-narrow="${privateNarrowStr}"
     data-msg-id="${item.id}">
  ${uiRecipients
    .map(r => r.full_name)
    .sort()
    .join(', ')}
</div>
    `;
  }

  return '';
};
