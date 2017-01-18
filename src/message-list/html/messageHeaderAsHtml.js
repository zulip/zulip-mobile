import { isStreamNarrow, isTopicNarrow, isPrivateNarrow, isGroupNarrow } from '../../utils/narrow';

export default ({ item, subscriptions, auth, narrow, doNarrow }) => {
  if (isStreamNarrow(narrow)) {
    return `
      <div class="topic-header">
        ${item.subject}
      </div>
    `;
  }

  if (item.type === 'stream') {
    const stream = subscriptions
      .find(x => x.name === item.display_recipient);

    const isPrivate = stream && stream.invite_only;
    const color = stream ? stream.color : '#ccc';

    return `
      <div class="stream-header">
        <div class="stream-text" style="background: ${color}">
          ${item.display_recipient}
        </div>
        <div class="arrow-right" style="border-left-color: ${color}"></div>
        <div class="title-text">
          ${item.subject}
        </div>
      </div>
    `;
  }

  if (item.type === 'private' &&
    !isPrivateNarrow(narrow) && !isGroupNarrow(narrow) && !isTopicNarrow(narrow)) {
    const recipients = item.display_recipient.filter(r => r.email !== auth.email);
    return `
      <div class="private-header">
        ${recipients.map(r => r.full_name).sort().join(', ')}
      </div>
    `;
  }

  return '';
};
