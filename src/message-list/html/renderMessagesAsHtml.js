import { getFullUrl } from '../../utils/url';
import {
  isTopicNarrow,
  isPrivateNarrow,
  isGroupNarrow,
} from '../../utils/narrow';
import { isSameRecipient } from '../../utils/message';
import { isSameDay } from '../../utils/date';

import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import messageLoadingAsHtml from './messageLoadingAsHtml';
import timeRowAsHtml from './timeRowAsHtml';


export default ({ auth, subscriptions, messages, isFetching, narrow, doNarrow }) =>
  messages.reduce((list, item, index) => {
    const prevItem = messages[index - 1];

    const diffDays = prevItem &&
      !isSameDay(new Date(prevItem.timestamp * 1000), new Date(item.timestamp * 1000));

    if (index === 0 || diffDays) {
      list.push(
        timeRowAsHtml(item.timestamp)
      );
    }

    const showHeader = !isPrivateNarrow(narrow) &&
      !isGroupNarrow(narrow) && !isTopicNarrow(narrow);
    const diffRecipient = !isSameRecipient(prevItem, item);

    if (showHeader && diffRecipient) {
      list.push(
        messageHeaderAsHtml({
          auth,
          item,
          subscriptions,
          narrow,
        })
      );
    }

    const shouldGroupWithPrev = !diffRecipient && !diffDays &&
      prevItem && prevItem.sender_full_name === item.sender_full_name;

    list.push(
      messageAsHtml({
        isBrief: shouldGroupWithPrev,
        fromName: item.sender_full_name,
        fromEmail: item.sender_email,
        message: item.content,
        timestamp: item.timestamp,
        avatarUrl: getFullUrl(item.avatar_url, auth.realm),
      })
    );

    return list;
  }, isFetching ? [
    messageLoadingAsHtml(),
    messageLoadingAsHtml(),
    messageLoadingAsHtml(),
    messageLoadingAsHtml(),
    messageLoadingAsHtml(),
    messageLoadingAsHtml(),
  ] : []);
