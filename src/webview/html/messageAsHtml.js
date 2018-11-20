/* @flow */
import template from './template';
import type {
  AlertWordsState,
  FlagsState,
  Narrow,
  Reaction,
  RealmEmojiState,
  Subscription,
} from '../../types';
import { shortTime } from '../../utils/date';
import messageTagsAsHtml from './messageTagsAsHtml';
import messageReactionListAsHtml from './messageReactionListAsHtml';
import processAlertWords from './processAlertWords';

/**
 * Data to be used in rendering all messages.
 *
 * See also MessageRenderData.
 */
export type RenderContext = {
  alertWords: AlertWordsState,
  flags: FlagsState,
  ownEmail: string,
  realmEmoji: RealmEmojiState,
  twentyFourHourTime: boolean,
  subscriptions: Subscription[],
  narrow: Narrow,
};

/**
 * Data to be used in rendering a specific message.
 *
 * See also RenderContext.
 */
type MessageRenderData = {
  content: string,
  id: number,
  isOutbox: boolean,
  reactions: Reaction[],
  timeEdited: ?number,
  fromName: string,
  fromEmail: string,
  timestamp: number,
  avatarUrl: string,
  isBrief: boolean,
};

export const flagsStateToStringList = (flags: FlagsState, id: number): string[] =>
  Object.keys(flags).filter(key => flags[key][id]);

const messageBody = (
  { alertWords, flags, ownEmail, realmEmoji }: RenderContext,
  { content, id, isOutbox, reactions, timeEdited }: MessageRenderData,
) => template`
$!${processAlertWords(content, id, alertWords, flags)}
$!${isOutbox ? '<div class="loading-spinner outbox-spinner"></div>' : ''}
$!${messageTagsAsHtml(!!flags.starred[id], timeEdited)}
$!${messageReactionListAsHtml(reactions, id, ownEmail, realmEmoji)}
`;

export default (context: RenderContext, message: MessageRenderData) => {
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
