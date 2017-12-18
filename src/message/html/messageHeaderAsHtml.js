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

const objToStr = obj => JSON.stringify(obj).replace(/"/g, "'");

export default ({ item, subscriptions, auth, narrow, doNarrow }) => {
  if (Object.keys(item).length === 0) {
    return '';
  }

  if (isStreamNarrow(narrow)) {
    const streamNarrowStr = objToStr(streamNarrow(item.display_recipient));

    return `
      <div id="${item.id}" class="topic-header header" data-narrow="${streamNarrowStr}">
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
      <div id="${item.id}" class="stream-header header">
        <div class="stream-text header" style="background: ${color}"
          data-narrow="${streamNarrowStr}">
          ${item.display_recipient}
        </div>
        <div class="arrow-right" style="border-left-color: ${color}"></div>
        <div class="title-text header" data-narrow="${topicNarrowStr}">
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
    const recipients = item.display_recipient.filter(r => r.email !== auth.email);
    const narrowObj =
      recipients.length === 1
        ? privateNarrow(recipients[0].email)
        : groupNarrow(recipients.map(r => r.email));
    const privateNarrowStr = objToStr(narrowObj);

    return `
      <div id="${item.id}" class="private-header header" data-narrow="${privateNarrowStr}">
        ${recipients
          .map(r => r.full_name)
          .sort()
          .join(', ')}
      </div>
    `;
  }

  return '';
};
