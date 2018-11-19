/* @flow */
import template from './template';
import type { AlertWordsState, FlagsState, Reaction, RealmEmojiState } from '../../types';
import { shortTime } from '../../utils/date';
import messageTagsAsHtml from './messageTagsAsHtml';
import messageReactionListAsHtml from './messageReactionListAsHtml';
import processAlertWords from './processAlertWords';

export const flagsStateToStringList = (flags: FlagsState, id: number): string[] =>
  Object.keys(flags).filter(key => flags[key][id]);

const messageDiv = (id: number, msgClass: string, flags: FlagsState): string =>
  template`<div
     class="message ${msgClass}"
     id="msg-${id}"
     data-msg-id="${id}"
     $!${flagsStateToStringList(flags, id)
       .map(flag => template`data-${flag}="true" `)
       .join('')}
    >`;

const messageSubheader = ({
  fromName,
  timestamp,
  twentyFourHourTime,
}: {
  fromName: string,
  timestamp: number,
  twentyFourHourTime: boolean,
}) => template`
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
  alertWords: AlertWordsState,
  content: string,
  flags: FlagsState,
  id: number,
  isOutbox: boolean,
  ownEmail: string,
  reactions: Reaction[],
  realmEmoji: RealmEmojiState,
  timeEdited: ?number,
};

type FullMessageProps = BriefMessageProps & {
  fromName: string,
  fromEmail: string,
  timestamp: number,
  avatarUrl: string,
  twentyFourHourTime: boolean,
};

type Props = FullMessageProps & {
  isBrief: boolean,
};

const messageBody = ({
  alertWords,
  content,
  flags,
  id,
  isOutbox,
  ownEmail,
  reactions,
  realmEmoji,
  timeEdited,
}: {
  alertWords: AlertWordsState,
  content: string,
  flags: FlagsState,
  id: number,
  isOutbox: boolean,
  ownEmail: string,
  reactions: Reaction[],
  realmEmoji: RealmEmojiState,
  timeEdited: ?number,
}) => template`
$!${processAlertWords(content, id, alertWords, flags)}
$!${isOutbox ? '<div class="loading-spinner outbox-spinner"></div>' : ''}
$!${messageTagsAsHtml(!!flags.starred[id], timeEdited)}
$!${messageReactionListAsHtml(reactions, id, ownEmail, realmEmoji)}
`;

const briefMessageAsHtml = ({
  alertWords,
  content,
  flags,
  id,
  isOutbox,
  ownEmail,
  reactions,
  realmEmoji,
  timeEdited,
}: BriefMessageProps) => template`
$!${messageDiv(id, 'message-brief', flags)}
  <div class="content">
    $!${messageBody({
      alertWords,
      content,
      flags,
      id,
      isOutbox,
      ownEmail,
      reactions,
      realmEmoji,
      timeEdited,
    })}
  </div>
</div>
`;

const fullMessageAsHtml = ({
  alertWords,
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
}: FullMessageProps) => template`
$!${messageDiv(id, 'message-full', flags)}
  <div class="avatar">
    <img src="${avatarUrl}" alt="${fromName}" class="avatar-img" data-email="${fromEmail}">
  </div>
  <div class="content">
    $!${messageSubheader({ fromName, timestamp, twentyFourHourTime })}
    $!${messageBody({
      alertWords,
      content,
      flags,
      id,
      isOutbox,
      ownEmail,
      reactions,
      realmEmoji,
      timeEdited,
    })}
  </div>
</div>
`;

export default (props: Props) =>
  props.isBrief ? briefMessageAsHtml(props) : fullMessageAsHtml(props);
