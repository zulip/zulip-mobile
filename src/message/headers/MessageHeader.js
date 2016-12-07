import React from 'react';

import { isStreamNarrow, isTopicNarrow, isPrivateNarrow, isGroupNarrow } from '../../utils/narrow';
import TopicMessageHeader from './TopicMessageHeader';
import StreamMessageHeader from './StreamMessageHeader';
import PrivateMessageHeader from './PrivateMessageHeader';

export default class MessageHeader extends React.PureComponent {

  props: {
    auth: Object,
    item: Object,
    subscriptions: any[],
    narrow: () => {},
  }

  render() {
    const { item, subscriptions, auth, narrow, doNarrow } = this.props;

    if (isStreamNarrow(narrow)) {
      return (
        <TopicMessageHeader
          key={`section_${item.id}`}
          topic={item.subject}
          doNarrow={doNarrow}
        />
      );
    }

    if (item.type === 'stream') {
      const subscription = Object.values(subscriptions)
        .find(x => x.name === item.display_recipient);
      return (
        <StreamMessageHeader
          key={`section_${item.id}`}
          isPrivate={item.invite_only}
          stream={item.display_recipient}
          topic={item.subject}
          color={subscription ? subscription.color : '#ccc'}
          item={item}
          narrow={narrow}
          doNarrow={doNarrow}
        />
      );
    }

    if (item.type === 'private' &&
      !isPrivateNarrow(narrow) && !isGroupNarrow(narrow) && !isTopicNarrow(narrow)) {
      const recipients = item.display_recipient.filter(r => r.email !== auth.email);
      return (
        <PrivateMessageHeader
          key={`section_${item.id}`}
          recipients={recipients}
          item={item}
          narrow={narrow}
          doNarrow={doNarrow}
        />
      );
    }

    return null;
  }
}
