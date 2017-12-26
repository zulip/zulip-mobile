import { shortTime } from '../../utils/date';
import messageTagsAsHtml from './messageTagsAsHtml';
import messageReactionListAsHtml from './messageReactionListAsHtml';

const briefMessageAsHtml = ({
  id,
  content,
  timeEdited,
  isOutbox,
  isStarred,
  reactions,
  ownEmail,
}) => `
  <div class="message" id="msg-${id}">
    <div class="avatar"><img></div>
    <div class="content">
      <div id="msg-${id}-content">
        ${content}
      </div>
      <div class="message-tags" id="msg-${id}-tags">
        ${messageTagsAsHtml(timeEdited, isOutbox, isStarred)}
      </div>
      ${messageReactionListAsHtml(reactions, id, ownEmail)}
    </div>
  </div>
`;

const fullMessageAsHtml = ({
  id,
  content,
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
}) => `
  <div class="message" id="msg-${id}">
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
      <div id="msg-${id}-content">
        ${content}
      </div>
      <div class="message-tags" id="msg-${id}-tags">
        ${messageTagsAsHtml(timeEdited, isOutbox, isStarred)}
      </div>
      ${messageReactionListAsHtml(reactions, id, ownEmail)}
    </div>
  </div>
`;

export default ({ isBrief, ...rest }) =>
  isBrief ? briefMessageAsHtml(rest) : fullMessageAsHtml(rest);
