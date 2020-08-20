/* @flow strict-local */
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import template from './template';
import type {
  AggregatedReaction,
  FlagsState,
  Message,
  MessageLike,
  Outbox,
  Reaction,
  ImageEmojiType,
} from '../../types';
import type { BackgroundData } from '../MessageList';
import { getAvatarFromMessage } from '../../utils/avatar';
import { shortTime } from '../../utils/date';
import aggregateReactions from '../../reactions/aggregateReactions';
import { codeToEmojiMap } from '../../emoji/data';
import processAlertWords from './processAlertWords';

const messageTagsAsHtml = (isStarred: boolean, timeEdited: number | void): string => {
  const pieces = [];
  if (timeEdited !== undefined) {
    const editedTime = distanceInWordsToNow(timeEdited * 1000);
    pieces.push(template`<span class="message-tag">edited ${editedTime} ago</span>`);
  }
  if (isStarred) {
    pieces.push('<span class="message-tag">starred</span>');
  }
  return !pieces.length ? '' : template`<div class="message-tags">$!${pieces.join('')}</div>`;
};

const messageReactionAsHtml = (
  reaction: AggregatedReaction,
  allImageEmojiById: $ReadOnly<{ [id: string]: ImageEmojiType }>,
): string =>
  template`<span onClick="" class="reaction${reaction.selfReacted ? ' self-voted' : ''}"
        data-name="${reaction.name}"
        data-code="${reaction.code}"
        data-type="${reaction.type}">$!${
    allImageEmojiById[reaction.code]
      ? template`<img src="${allImageEmojiById[reaction.code].source_url}"/>`
      : codeToEmojiMap[reaction.code]
  }&nbsp;${reaction.count}</span>`;

const messageReactionListAsHtml = (
  reactions: $ReadOnlyArray<Reaction>,
  ownUserId: number,
  allImageEmojiById: $ReadOnly<{ [id: string]: ImageEmojiType }>,
): string => {
  if (reactions.length === 0) {
    return '';
  }
  const htmlList = aggregateReactions(reactions, ownUserId).map(r =>
    messageReactionAsHtml(r, allImageEmojiById),
  );
  return template`<div class="reaction-list">$!${htmlList.join('')}</div>`;
};

const messageBody = (
  { alertWords, flags, ownUser, allImageEmojiById }: BackgroundData,
  message: Message | Outbox,
) => {
  const { id, isOutbox, last_edit_timestamp, match_content, reactions } = (message: MessageLike);
  const content = match_content ?? message.content;
  return template`
$!${processAlertWords(content, id, alertWords, flags)}
$!${isOutbox ? '<div class="loading-spinner outbox-spinner"></div>' : ''}
$!${messageTagsAsHtml(!!flags.starred[id], last_edit_timestamp)}
$!${messageReactionListAsHtml(reactions, ownUser.user_id, allImageEmojiById)}
`;
};

const widgetBody = (message: Message | Outbox) => template`
$!${message.content}
<div class="widget"
 ><p>Interactive message</p
 ><p>To use, open on web or desktop</p
></div>
`;

export const flagsStateToStringList = (flags: FlagsState, id: number): string[] =>
  Object.keys(flags).filter(key => flags[key][id]);

export default (backgroundData: BackgroundData, message: Message | Outbox, isBrief: boolean) => {
  const { id, timestamp } = message;
  const flagStrings = flagsStateToStringList(backgroundData.flags, id);
  const divOpenHtml = template`
    <div
     class="message ${isBrief ? 'message-brief' : 'message-full'}"
     id="msg-${id}"
     data-msg-id="${id}"
     $!${flagStrings.map(flag => template`data-${flag}="true" `).join('')}
    >`;
  const messageTime = shortTime(new Date(timestamp * 1000), backgroundData.twentyFourHourTime);

  const timestampHtml = (showOnRender: boolean) => template`
<div class="time-container">
  <div class="timestamp ${showOnRender ? 'show' : ''}">
    ${messageTime}
  </div>
</div>
`;
  const bodyHtml =
    message.submessages && message.submessages.length > 0
      ? widgetBody(message)
      : messageBody(backgroundData, message);

  if (isBrief) {
    return template`
$!${divOpenHtml}
  <div class="content">
    $!${timestampHtml(false)}
    $!${bodyHtml}
  </div>
</div>
`;
  }

  const { sender_full_name } = message;
  const sender_id = message.isOutbox ? backgroundData.ownUser.user_id : message.sender_id;
  const avatarUrl = getAvatarFromMessage(message, backgroundData.auth.realm);
  const subheaderHtml = template`
<div class="subheader">
  <div class="username">
    ${sender_full_name}
  </div>
  <div class="static-timestamp">${messageTime}</div>
</div>
`;

  return template`
$!${divOpenHtml}
  <div class="avatar">
    <img src="${avatarUrl}" alt="${sender_full_name}" class="avatar-img" data-sender-id="${sender_id}">
  </div>
  <div class="content">
    $!${subheaderHtml}
    $!${bodyHtml}
  </div>
</div>
`;
};
