/* @flow strict-local */
import React, { createContext, useState, useCallback, useContext } from 'react';
import type { Context, Node } from 'react';
import { useSelector } from '../react-redux';
import TopicEditModal from '../topics/TopicEditModal';
import { getAuth, getZulipFeatureLevel, getStreamsById } from '../selectors';
import { TranslationContext } from './TranslationProvider';

type Props = $ReadOnly<{|
  children: Node,
|}>;

type StartEditTopicContext = (
  streamId: number,
  topic: string,
) => Promise<void>;

// $FlowIssue[incompatible-type]
const TopicModal: Context<StartEditTopicContext> = createContext(undefined);

export const useStartEditTopic = ():StartEditTopicContext => useContext(TopicModal);

export default function TopicEditModalProvider(props: Props): Node {
  const { children } = props;
  const auth = useSelector(getAuth);
  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const streamsById = useSelector(getStreamsById);
  const _ = useContext(TranslationContext);

  const [topicModalProviderState, setTopicModalProviderState] = useState({
    visible: false,
    streamId: -1,
    topic: '',
  });

  const startEditTopic = useCallback(
    async (streamId: number, topic: string) => {
      const { visible } = topicModalProviderState;
      if (visible) {
        return;
      }
      setTopicModalProviderState({
        visible: true,
        streamId,
        topic,
      });
    }, [topicModalProviderState]);

  const closeEditTopicModal = useCallback(() => {
    setTopicModalProviderState({
      visible: false,
      streamId: -1,
      topic: '',
    });
  }, []);

  return (
    <TopicModal.Provider value={startEditTopic}>
      <TopicEditModal
        topicModalProviderState={topicModalProviderState}
        closeEditTopicModal={closeEditTopicModal}
        auth={auth}
        zulipFeatureLevel={zulipFeatureLevel}
        streamsById={streamsById}
        _={_}
      />
      {children}
    </TopicModal.Provider>
  );
}
