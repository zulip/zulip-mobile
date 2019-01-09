/* @flow strict-local */
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import template from './template';
import type {
  AggregatedReaction,
  FlagsState,
  Message,
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
  allRealmEmojiById: $ReadOnly<{ [id: string]: ImageEmojiType }>,
): string =>
  template`<span onClick="" class="reaction${reaction.selfReacted ? ' self-voted' : ''}"
        data-name="${reaction.name}"
        data-code="${reaction.code}"
        data-type="${reaction.type}">$!${
    allRealmEmojiById[reaction.code]
      ? template`<img src="${allRealmEmojiById[reaction.code].source_url}"/>`
      : codeToEmojiMap[reaction.code]
  }&nbsp;${reaction.count}</span>`;

const messageReactionListAsHtml = (
  reactions: $ReadOnlyArray<Reaction>,
  ownEmail: string,
  allRealmEmojiById: $ReadOnly<{ [id: string]: ImageEmojiType }>,
): string => {
  if (reactions.length === 0) {
    return '';
  }
  const htmlList = aggregateReactions(reactions, ownEmail).map(r =>
    messageReactionAsHtml(r, allRealmEmojiById),
  );
  return template`<div class="reaction-list">$!${htmlList.join('')}</div>`;
};

const messageBody = (
  { alertWords, flags, ownEmail, allRealmEmojiById }: BackgroundData,
  message: Message | Outbox,
) => {
  const { id, isOutbox, last_edit_timestamp, reactions } = message;
  const content = message.match_content !== undefined ? message.match_content : message.content;
  return template`
$!${processAlertWords(content, id, alertWords, flags)}
$!${isOutbox ? '<div class="loading-spinner outbox-spinner"></div>' : ''}
$!${messageTagsAsHtml(!!flags.starred[id], last_edit_timestamp)}
$!${messageReactionListAsHtml(reactions, ownEmail, allRealmEmojiById)}
`;
};

export const flagsStateToStringList = (flags: FlagsState, id: number): string[] =>
  Object.keys(flags).filter(key => flags[key][id]);

export default (backgroundData: BackgroundData, message: Message | Outbox, isBrief: boolean) => {
  const { id } = message;
  const flagStrings = flagsStateToStringList(backgroundData.flags, id);
  const divOpenHtml = template`
    <div
     class="message ${isBrief ? 'message-brief' : 'message-full'}"
     id="msg-${id}"
     data-msg-id="${id}"
     $!${flagStrings.map(flag => template`data-${flag}="true" `).join('')}
    >`;

  const bodyHtml = messageBody(backgroundData, message);

  if (isBrief) {
    return template`
$!${divOpenHtml}
  <div class="content">
    $!${bodyHtml}
  </div>
</div>
`;
  }

  const { sender_full_name, sender_email, timestamp } = message;
  const avatarUrl = getAvatarFromMessage(message, backgroundData.auth.realm);
  const subheaderHtml = template`
<div class="subheader">
  <div class="username">
    ${sender_full_name}
  </div>
  <div class="timestamp">
    ${shortTime(new Date(timestamp * 1000), backgroundData.twentyFourHourTime)}
  </div>
</div>
`;

  return template`
$!${divOpenHtml}
  <div class="avatar">
    <img src="${avatarUrl}" alt="${sender_full_name}" class="avatar-img" data-email="${sender_email}">
  </div>
  <div class="content">
    $!${subheaderHtml}
    $!${bodyHtml}
  </div>
</div>
`;
};
