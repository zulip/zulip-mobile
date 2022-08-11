/* @flow strict-local */
import React, { createContext, useState, useMemo, useCallback, useContext } from 'react';
import type { Context, Node } from 'react';
import { useSelector } from '../react-redux';
import TopicEditModal from '../topics/TopicEditModal';
import type { Stream, GetText } from '../types';
import { fetchSomeMessageIdForConversation } from '../message/fetchActions';
import { getAuth, getZulipFeatureLevel } from '../selectors';

type Props = $ReadOnly<{|
  children: Node,
|}>;

type TopicModalContext = $ReadOnly<{|
  startEditTopic: (
    streamId: number,
    topic: string,
    streamsById: Map<number, Stream>,
    _: GetText,
  ) => Promise<void>,
  closeEditTopicModal: () => void,
|}>;

// $FlowIssue[incompatible-type]
const TopicModal: Context<TopicModalContext> = createContext(undefined);

export const useTopicModalHandler = (): TopicModalContext => useContext(TopicModal);

export default function TopicModalProvider(props: Props): Node {
  const { children } = props;
  const auth = useSelector(getAuth);
  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const [topicModalState, setTopicModalState] = useState({
    visible: false,
    topic: '',
    fetchArgs: {
      auth: null,
      messageId: null,
      zulipFeatureLevel: null,
    },
  });

  const startEditTopic = useCallback(
    async (streamId, topic, streamsById, _) => {
      const messageId = await fetchSomeMessageIdForConversation(
        auth,
        streamId,
        topic,
        streamsById,
        zulipFeatureLevel,
      );
      if (messageId == null) {
        throw new Error(
          _('No messages in topic: {streamAndTopic}', {
            streamAndTopic: `#${streamsById.get(streamId)?.name ?? 'unknown'} > ${topic}`,
          }),
        );
      }
      setTopicModalState({
        visible: true,
        topic,
        fetchArgs: { auth, messageId, zulipFeatureLevel },
      });
    },
    [auth, zulipFeatureLevel],
  );

  const closeEditTopicModal = useCallback(() => {
    setTopicModalState({
      visible: false,
      topic: null,
      fetchArgs: { auth: null, messageId: null, zulipFeatureLevel: null },
    });
  }, []);

  const topicModalHandler = useMemo(
    () => ({
      startEditTopic,
      closeEditTopicModal,
    }),
    [startEditTopic, closeEditTopicModal],
  );

  return (
    <TopicModal.Provider value={topicModalHandler}>
      {topicModalState.visible && (
        <TopicEditModal topicModalState={topicModalState} topicModalHandler={topicModalHandler} />
      )}
      {children}
    </TopicModal.Provider>
  );
}
