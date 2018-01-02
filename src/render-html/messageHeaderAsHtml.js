import {
  isStreamNarrow,
  isTopicNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  streamNarrow,
  topicNarrow,
  privateNarrow,
  groupNarrow,
} from '../utils/narrow';

const objToStr = obj => JSON.stringify(obj).replace(/"/g, "'");

export default ({ item, subscriptions, auth, narrow, doNarrow }) => {
  if (Object.keys(item).length === 0) {
    return '';
  }

  if (isStreamNarrow(narrow)) {
    const topicNarrowStr = objToStr(topicNarrow(item.display_recipient, item.subject));

    return `
      <div
        class="header-wrapper header topic-text"
        data-narrow="${topicNarrowStr}"
        data-msg-id="${item.id}"
      >
        ${item.subject}
      </div>
    `;
  }

  if (item.type === 'stream') {
    const stream = subscriptions.find(x => x.name === item.display_recipient);

    const color = stream ? stream.color : '#ccc';
    const streamNarrowStr = objToStr(streamNarrow(item.display_recipient));
    const topicNarrowStr = objToStr(topicNarrow(item.display_recipient, item.subject));

    return `
      <div class="header-wrapper stream-header" data-msg-id="${item.id}">
        <div class="header stream-text" style="background: ${color}" data-narrow="${streamNarrowStr}">
          ${item.display_recipient}
        </div>
        <div class="header topic-text" data-narrow="${topicNarrowStr}">
          ${item.subject}
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
    const privateNarrowStr = objToStr(narrowObj);

    return `
      <div class="private-header header" data-narrow="${privateNarrowStr}" data-msg-id="${item.id}">
        ${recipients
          .map(r => r.full_name)
          .sort()
          .join(', ')}
      </div>
    `;
  }

  return '';
};
