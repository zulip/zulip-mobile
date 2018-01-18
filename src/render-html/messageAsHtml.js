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

const briefMessageAsHtml = ({ id, content, flags, timeEdited, isOutbox, reactions, ownEmail }) => `
${messageDiv(id, 'message-brief', flags)}
  <div class="content">
    <div class="msg-raw-content">
      ${content}
    </div>
    ${messageTagsAsHtml(flags, timeEdited, isOutbox)}
    ${messageReactionListAsHtml(reactions, id, ownEmail)}
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
    <div class="subheader">
      <div class="username">
        ${fromName}
      </div>
      <div class="timestamp">
        ${shortTime(timestamp * 1000, twentyFourHourTime)}
      </div>
    </div>
    <div class="msg-raw-content">
      ${content}
    </div>
    ${messageTagsAsHtml(flags, timeEdited, isOutbox)}
    ${messageReactionListAsHtml(reactions, id, ownEmail)}
  </div>
</div>
`;

export default ({ isBrief, ...rest }) =>
  isBrief ? briefMessageAsHtml(rest) : fullMessageAsHtml(rest);
