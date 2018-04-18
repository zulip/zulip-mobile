/* @flow */
import type { FlagsState, ReactionType, RealmEmojiType } from '../types';
import { shortTime } from '../utils/date';
import messageTagsAsHtml from './messageTagsAsHtml';
import messageReactionListAsHtml from './messageReactionListAsHtml';

const messageDiv = (id: number, msgClass: string, flags: Object): string =>
  `<div
     class="message ${msgClass}"
     id="msg-${id}"
     data-msg-id="${id}"
     ${flags.map(flag => `data-${flag}="true" `).join('')}
    >`;

const messageSubheader = ({
  fromName,
  timestamp,
  twentyFourHourTime,
}: {
  fromName: string,
  timestamp: number,
  twentyFourHourTime: boolean,
}) => `
<div class="subheader">
  <div class="username">
    ${fromName}
  </div>
  <div class="timestamp">
    ${shortTime(new Date(timestamp * 1000), twentyFourHourTime)}
  </div>
</div>
`;

type BriefMessageProps = {
  content: string,
  flags: FlagsState,
  id: number,
  isOutbox: boolean,
  ownEmail: string,
  reactions: ReactionType[],
  realmEmoji: RealmEmojiType,
  timeEdited: Date,
  zulipExtraEmojis: Object,
};

type FullMessageProps = BriefMessageProps & {
  fromName: string,
  fromEmail: string,
  timestamp: number,
  avatarUrl: string,
  twentyFourHourTime: boolean,
  zulipExtraEmojis: Object,
};

type Props = FullMessageProps & {
  isBrief: boolean,
};

const messageBody = ({
  content,
  flags,
  id,
  isOutbox,
  ownEmail,
  reactions,
  realmEmoji,
  timeEdited,
  zulipExtraEmojis,
}: {
  content: string,
  flags: Object,
  id: number,
  isOutbox: boolean,
  ownEmail: string,
  reactions: ReactionType[],
  realmEmoji: ReactionType,
  timeEdited: Date,
  zulipExtraEmojis: Object,
}) => `
${content}
${isOutbox ? '<div class="loading-spinner outbox-spinner"></div>' : ''}
${messageTagsAsHtml(flags, timeEdited)}
${messageReactionListAsHtml(reactions, id, ownEmail, realmEmoji, zulipExtraEmojis)}
`;

const briefMessageAsHtml = ({
  content,
  flags,
  id,
  isOutbox,
  ownEmail,
  reactions,
  realmEmoji,
  timeEdited,
  zulipExtraEmojis,
}: BriefMessageProps) => `
${messageDiv(id, 'message-brief', flags)}
  <div class="content">
    ${messageBody({
      content,
      flags,
      id,
      isOutbox,
      ownEmail,
      reactions,
      realmEmoji,
      timeEdited,
      zulipExtraEmojis,
    })}
  </div>
</div>
`;

const fullMessageAsHtml = ({
  id,
  content,
  flags,
  fromName,
  fromEmail,
  timestamp,
  avatarUrl,
  twentyFourHourTime,
  timeEdited,
  isOutbox,
  reactions,
  ownEmail,
  realmEmoji,
  zulipExtraEmojis,
}: FullMessageProps) => `
${messageDiv(id, 'message-full', flags)}
  <div class="avatar">
    <img src="${avatarUrl}" class="avatar-img" data-email="${fromEmail}">
  </div>
  <div class="content">
    ${messageSubheader({ fromName, timestamp, twentyFourHourTime })}
    ${messageBody({
      content,
      flags,
      id,
      isOutbox,
      ownEmail,
      reactions,
      realmEmoji,
      timeEdited,
      zulipExtraEmojis,
    })}
  </div>
</div>
`;

export default (props: Props) =>
  props.isBrief ? briefMessageAsHtml(props) : fullMessageAsHtml(props);
