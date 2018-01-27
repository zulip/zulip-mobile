import { shortTime } from '../utils/date';
import messageTagsAsHtml from './messageTagsAsHtml';
import messageReactionListAsHtml from './messageReactionListAsHtml';

const messageDiv = (id, msgClass, flags) =>
  `<div
     class="message ${msgClass}"
     id="msg-${id}"
     data-msg-id="${id}"
     ${flags.map(flag => `data-${flag}="true" `).join('')}
    >`;

const messageSubheader = ({ fromName, timestamp, twentyFourHourTime }) => `
<div class="subheader">
  <div class="username">
    ${fromName}
  </div>
  <div class="timestamp">
    ${shortTime(timestamp * 1000, twentyFourHourTime)}
  </div>
</div>
`;

const messageBody = ({
  content,
  flags,
  id,
  isOutbox,
  ownEmail,
  reactions,
  realmEmoji,
  timeEdited,
}) => `
${content}
${isOutbox ? '<div class="loading-spinner outbox-spinner"></div>' : ''}
${messageTagsAsHtml(flags, timeEdited)}
${messageReactionListAsHtml(reactions, id, ownEmail, realmEmoji)}
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
}) => `
${messageDiv(id, 'message-brief', flags)}
  <div class="content">
    ${messageBody({ content, flags, id, isOutbox, ownEmail, reactions, realmEmoji, timeEdited })}
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
  isStarred,
  reactions,
  ownEmail,
  isMentioned,
  realmEmoji,
}) => `
${messageDiv(id, 'message-full', flags)}
  <div class="avatar">
    <img src="${avatarUrl}" class="avatar-img" data-email="${fromEmail}">
  </div>
  <div class="content">
    ${messageSubheader({ fromName, timestamp, twentyFourHourTime })}
    ${messageBody({ content, flags, id, isOutbox, ownEmail, reactions, realmEmoji, timeEdited })}
  </div>
</div>
`;

export default ({ isBrief, ...rest }) =>
  isBrief ? briefMessageAsHtml(rest) : fullMessageAsHtml(rest);
