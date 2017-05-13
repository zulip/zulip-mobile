import {
  isStreamNarrow,
  isTopicNarrow,
  isPrivateNarrow,
  isGroupNarrow,
} from '../utils/narrow';

export default (narrow, ownEmail, users) => {
  if (isGroupNarrow(narrow)) {
    return 'Message group';
  } else if (isPrivateNarrow(narrow)) {
    if (ownEmail && narrow[0].operand === ownEmail) return 'Jot down something';
    else if (users) {
      const user = users.find(u => u.email === narrow[0].operand);
      return user && `Message @${user.fullName}`;
    } else {
      return 'Type a message';
    }
  } else if (isStreamNarrow(narrow)) {
    return `Message #${narrow[0].operand}`;
  } else if (isTopicNarrow(narrow)) {
    return `Message #${narrow[0].operand} topic:${narrow[1].operand}`;
  } else {
    return 'Type a message';
  }
};
