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

/** Data to be used in rendering all messages. */
export type RenderContext = {
  alertWords: AlertWordsState,
  flags: FlagsState,
  ownEmail: string,
  realmEmoji: RealmEmojiState,
  twentyFourHourTime: boolean,
};

type BriefMessageProps = {
  content: string,
  id: number,
  isOutbox: boolean,
  reactions: Reaction[],
  timeEdited: ?number,
};

type FullMessageProps = BriefMessageProps & {
  fromName: string,
  fromEmail: string,
  timestamp: number,
  avatarUrl: string,
};

type Props = FullMessageProps & {
  isBrief: boolean,
};

const messageBody = (
  { alertWords, flags, ownEmail, realmEmoji }: RenderContext,
  {
    content,
    id,
    isOutbox,
    reactions,
    timeEdited,
  }: {
    content: string,
    id: number,
    isOutbox: boolean,
    reactions: Reaction[],
    timeEdited: ?number,
  },
) => template`
$!${processAlertWords(content, id, alertWords, flags)}
$!${isOutbox ? '<div class="loading-spinner outbox-spinner"></div>' : ''}
$!${messageTagsAsHtml(!!flags.starred[id], timeEdited)}
$!${messageReactionListAsHtml(reactions, id, ownEmail, realmEmoji)}
`;

const briefMessageAsHtml = (
  context: RenderContext,
  { content, id, isOutbox, reactions, timeEdited }: BriefMessageProps,
) => template`
$!${messageDiv(id, 'message-brief', context.flags)}
  <div class="content">
    $!${messageBody(context, {
      content,
      id,
      isOutbox,
      reactions,
      timeEdited,
    })}
  </div>
</div>
`;

const fullMessageAsHtml = (
  context: RenderContext,
  {
    id,
    content,
    fromName,
    fromEmail,
    timestamp,
    avatarUrl,
    timeEdited,
    isOutbox,
    reactions,
  }: FullMessageProps,
) => template`
$!${messageDiv(id, 'message-full', context.flags)}
  <div class="avatar">
    <img src="${avatarUrl}" alt="${fromName}" class="avatar-img" data-email="${fromEmail}">
  </div>
  <div class="content">
    $!${messageSubheader({ fromName, timestamp, twentyFourHourTime: context.twentyFourHourTime })}
    $!${messageBody(context, {
      content,
      id,
      isOutbox,
      reactions,
      timeEdited,
    })}
  </div>
</div>
`;

export default (renderContext: RenderContext, props: Props) =>
  props.isBrief
    ? briefMessageAsHtml(renderContext, props)
    : fullMessageAsHtml(renderContext, props);
