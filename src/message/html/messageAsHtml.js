import { shortTime } from '../../utils/date';
import messageTagsAsHtml from './messageTagsAsHtml';

const briefMessageAsHtml = ({ id, content, timeEdited, isOutbox, isStarred }) => `
  <div class="message" id="${id}">
    <div class="avatar"><img></div>
    <div class="content">
      ${content}
      ${messageTagsAsHtml(timeEdited, isOutbox, isStarred)}
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
}) => `
  <div class="message" id="${id}">
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
      ${messageTagsAsHtml(timeEdited, isOutbox, isStarred)}
    </div>
  </div>
`;

export default ({ isBrief, ...rest }) =>
  isBrief ? briefMessageAsHtml(rest) : fullMessageAsHtml(rest);
