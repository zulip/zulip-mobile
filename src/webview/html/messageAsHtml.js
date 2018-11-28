/* @flow strict-local */
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import template from './template';
import type { AggregatedReaction, FlagsState, Reaction, RealmEmojiType } from '../../types';
import type { BackgroundData } from '../MessageList';
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
  allRealmEmojiById: { [id: string]: RealmEmojiType },
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
  reactions: Reaction[],
  ownEmail: string,
  allRealmEmojiById: { [id: string]: RealmEmojiType },
): string => {
  if (reactions.length === 0) {
    return '';
  }
  const htmlList = aggregateReactions(reactions, ownEmail).map(r =>
    messageReactionAsHtml(r, allRealmEmojiById),
  );
  return template`<div class="reaction-list">$!${htmlList.join('')}</div>`;
};

/** Data to be used in rendering a specific message. */
type MessageRenderData = {
  content: string,
  id: number,
  isOutbox: boolean,
  reactions: Reaction[],
  timeEdited: number | void,
  fromName: string,
  fromEmail: string,
  timestamp: number,
  avatarUrl: string,
  isBrief: boolean,
};

const messageBody = (
  { alertWords, flags, ownEmail, allRealmEmojiById }: BackgroundData,
  { content, id, isOutbox, reactions, timeEdited }: MessageRenderData,
) => template`
$!${processAlertWords(content, id, alertWords, flags)}
$!${isOutbox ? '<div class="loading-spinner outbox-spinner"></div>' : ''}
$!${messageTagsAsHtml(!!flags.starred[id], timeEdited)}
$!${messageReactionListAsHtml(reactions, ownEmail, allRealmEmojiById)}
`;

export const flagsStateToStringList = (flags: FlagsState, id: number): string[] =>
  Object.keys(flags).filter(key => flags[key][id]);

export default (context: BackgroundData, message: MessageRenderData) => {
  const { id, isBrief } = message;
  const flagStrings = flagsStateToStringList(context.flags, id);
  const divOpenHtml = template`
    <div
     class="message ${isBrief ? 'message-brief' : 'message-full'}"
     id="msg-${id}"
     data-msg-id="${id}"
     $!${flagStrings.map(flag => template`data-${flag}="true" `).join('')}
    >`;

  const bodyHtml = messageBody(context, message);

  if (message.isBrief) {
    return template`
$!${divOpenHtml}
  <div class="content">
    $!${bodyHtml}
  </div>
</div>
`;
  }

  const { fromName, fromEmail, timestamp, avatarUrl } = message;
  const subheaderHtml = template`
<div class="subheader">
  <div class="username">
    ${fromName}
  </div>
  <div class="timestamp">
    ${shortTime(new Date(timestamp * 1000), context.twentyFourHourTime)}
  </div>
</div>
`;

  return template`
$!${divOpenHtml}
  <div class="avatar">
    <img src="${avatarUrl}" alt="${fromName}" class="avatar-img" data-email="${fromEmail}">
  </div>
  <div class="content">
    $!${subheaderHtml}
    $!${bodyHtml}
  </div>
</div>
`;
};
