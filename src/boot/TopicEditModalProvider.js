/* @flow strict-local */
import React, { createContext, useState, useCallback, useContext } from 'react';
import type { Context, Node } from 'react';

import TopicEditModal from '../topics/TopicEditModal';

type Props = $ReadOnly<{|
  children: Node,
|}>;

export type TopicEditProviderStateType = {
  streamId: number,
  oldTopic: string,
};

type StartEditTopicContext = (streamId: number, oldTopic: string) => void;

const TopicEditModalContext: Context<StartEditTopicContext> = createContext(() => {
  throw new Error(
    'Tried to open the edit-topic UI from a component without TopicEditModalProvider above it in the tree.',
  );
});

export const useStartEditTopic = (): StartEditTopicContext => useContext(TopicEditModalContext);

export default function TopicEditModalProvider(props: Props): Node {
  const { children } = props;

  const [topicModalProviderState, setTopicModalProviderState] =
    useState<TopicEditProviderStateType | null>(null);

  const startEditTopic = useCallback(
    (streamIdArg, oldTopicArg) => {
      if (!topicModalProviderState) {
        setTopicModalProviderState({
          streamId: streamIdArg,
          oldTopic: oldTopicArg,
        });
      }
    },
    [topicModalProviderState],
  );

  const closeEditTopicModal = () => {
    setTopicModalProviderState(null);
  };

  return (
    <TopicEditModalContext.Provider value={startEditTopic}>
      <TopicEditModal
        topicModalProviderState={topicModalProviderState}
        closeEditTopicModal={closeEditTopicModal}
      />
      {children}
    </TopicEditModalContext.Provider>
  );
}
