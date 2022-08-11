/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import MessageList from '../webview/MessageList';
import { useTopicModalHandler } from '../boot/TopicModalProvider';
import type { Message, Narrow } from '../types';

type Props = $ReadOnly<{|
  messages: $ReadOnlyArray<Message>,
  narrow: Narrow,
|}>;

/* We can't call Context hooks from SearchMessagesCard because it's a class component. This wrapper allows the startEditTopic callback to be passed to this particular MessageList child without breaking Rules of Hooks. */

export default function MessageListWrapper({ messages, narrow }: Props): Node {
  const { startEditTopic } = useTopicModalHandler();

  return (
    <MessageList
      initialScrollMessageId={
        // This access is OK only because of the `.length === 0` check
        // above.
        messages[messages.length - 1].id
      }
      messages={messages}
      narrow={narrow}
      showMessagePlaceholders={false}
      // TODO: handle editing a message from the search results,
      // or make this prop optional
      startEditMessage={() => undefined}
      startEditTopic={startEditTopic}
    />
  );
}
