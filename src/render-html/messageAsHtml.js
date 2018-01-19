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

const messageBody = ({ content, flags, isOutbox, id, ownEmail, timeEdited, reactions }) => `
<div class="msg-raw-content">
  ${content}
</div>
${messageTagsAsHtml(flags, timeEdited, isOutbox)}
${messageReactionListAsHtml(reactions, id, ownEmail)}
`;

const briefMessageAsHtml = ({ id, content, flags, timeEdited, isOutbox, reactions, ownEmail }) => `
${messageDiv(id, 'message-brief', flags)}
  <div class="content">
    ${messageBody({ content, flags, isOutbox, id, ownEmail, timeEdited, reactions })}
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
}) => `
${messageDiv(id, 'message-full', flags)}
  <div class="avatar">
    <img src="${avatarUrl}" class="avatar-img" data-email="${fromEmail}">
  </div>
  <div class="content">
    ${messageSubheader({ fromName, timestamp, twentyFourHourTime })}
    ${messageBody({ content, flags, isOutbox, id, ownEmail, timeEdited, reactions })}
  </div>
</div>
`;

export default ({ isBrief, ...rest }) =>
  isBrief ? briefMessageAsHtml(rest) : fullMessageAsHtml(rest);
