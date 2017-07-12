import { shortTime } from '../../utils/date';

const briefMessageAsHtml = ({ id, message }) => `
  <div class="message" id="${id}">
    <div class="avatar"><img></div>
    <div class="content">
      ${message}
    </div>
  </div>
`;

const fullMessageAsHtml = ({
  id,
  message,
  fromName,
  fromEmail,
  timestamp,
  avatarUrl,
  twentyFourHourTime,
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
      ${message}
    </div>
  </div>
`;

export default ({ isBrief, ...rest }) =>
  isBrief ? briefMessageAsHtml(rest) : fullMessageAsHtml(rest);
