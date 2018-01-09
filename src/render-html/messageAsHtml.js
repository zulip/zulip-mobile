import { shortTime } from '../utils/date';
import messageTagsAsHtml from './messageTagsAsHtml';
import messageReactionListAsHtml from './messageReactionListAsHtml';

const messageDiv = (id, msgClass, flags) => {
  const isMentioned = flags.indexOf('mentioned') > -1 || flags.indexOf('wildcard_mentioned') > -1;

  return `<div class="message ${msgClass}" id="msg-${id}" data-msg-id="${id}" data-mentioned="${isMentioned}">`;
};

const briefMessageAsHtml = ({ id, content, flags, timeEdited, isOutbox, reactions, ownEmail }) => `
${messageDiv(id, 'message-brief', flags)}
  <div class="content">
    ${content}
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
    ${content}
    ${messageTagsAsHtml(flags, timeEdited, isOutbox)}
    ${messageReactionListAsHtml(reactions, id, ownEmail)}
  </div>
</div>
`;

export default ({ isBrief, ...rest }) =>
  isBrief ? briefMessageAsHtml(rest) : fullMessageAsHtml(rest);
