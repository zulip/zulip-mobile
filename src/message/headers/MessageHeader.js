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
          itemId={item.id}
          stream={item.display_recipient}
          topic={item.subject}
          doNarrow={doNarrow}
        />
      );
    }

    if (item.type === 'stream') {
      const stream = subscriptions
        .find(x => x.name === item.display_recipient);

      return (
        <StreamMessageHeader
          key={`section_${item.id}`}
          isPrivate={stream && stream.invite_only}
          stream={item.display_recipient}
          topic={item.subject}
          color={stream ? stream.color : '#ccc'}
          itemId={item.id}
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
          itemId={item.id}
          doNarrow={doNarrow}
        />
      );
    }

    return null;
  }
}
