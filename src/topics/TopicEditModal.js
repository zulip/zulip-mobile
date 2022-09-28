// @flow strict-local
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Modal, Pressable, View, TextInput, Platform } from 'react-native';
import type { Node } from 'react';
import { ThemeContext, BRAND_COLOR, createStyleSheet } from '../styles';
import { updateMessage } from '../api';
import type { Auth, GetText, Stream } from '../types';
import { fetchSomeMessageIdForConversation } from '../message/fetchActions';
import ZulipTextIntl from '../common/ZulipTextIntl';

type Props = $ReadOnly<{|
  topicModalProviderState: {
    visible: boolean,
    topic: string,
    streamId: number,
  },
  auth: Auth,
  zulipFeatureLevel: number,
  streamsById: Map<number, Stream>,
  _: GetText,
  closeEditTopicModal: () => void,
|}>;

export default function TopicEditModal(props: Props): Node {
  const {
    topicModalProviderState,
    closeEditTopicModal,
    auth,
    zulipFeatureLevel,
    streamsById,
    _,
  } = props;

  const { visible, topic, streamId } = topicModalProviderState;

  const [topicName, onChangeTopicName] = useState();

  useEffect(() => {
    onChangeTopicName(topic);
  }, [topic]);

  const { backgroundColor } = useContext(ThemeContext);

  const inputMarginPadding = useMemo(
    () => ({
      paddingHorizontal: 8,
      paddingVertical: Platform.select({
        ios: 8,
        android: 2,
      }),
    }),
    [],
  );

  const styles = createStyleSheet({
    wrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      margin: 10,
      alignItems: 'center',
      backgroundColor,
      padding: 20,
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 20,
      width: '90%',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '60%',
    },
    input: {
      width: '90%',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 16,
      ...inputMarginPadding,
      backgroundColor: 'white',
      borderStyle: 'solid',
      borderColor: 'black',
    },
    button: {
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 32,
      padding: 8,
    },
    titleText: {
      fontSize: 18,
      lineHeight: 21,
      fontWeight: 'bold',
      color: BRAND_COLOR,
      marginBottom: 12,
    },
    text: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: 'bold',
    },
    submitButtonText: {
      color: 'white',
    },
    cancelButtonText: {
      color: BRAND_COLOR,
    },
  });

  const handleSubmit = async () => {
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
    await updateMessage(auth, messageId, {
      propagate_mode: 'change_all',
      subject: topicName,
      ...(zulipFeatureLevel >= 9 && {
        send_notification_to_old_thread: true,
        send_notification_to_new_thread: true,
      }),
    });
    closeEditTopicModal();
  };
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={closeEditTopicModal}>
      <View style={styles.wrapper}>
        <View style={styles.modalView}>
          <ZulipTextIntl style={styles.titleText} text="Edit topic" />
          <TextInput
            style={styles.input}
            value={topicName}
            onChangeText={onChangeTopicName}
            selectTextOnFocus
          />
          <View style={styles.buttonContainer}>
            <Pressable
              style={{
                backgroundColor,
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: BRAND_COLOR,
                ...styles.button,
              }}
              onPress={closeEditTopicModal}
            >
              <ZulipTextIntl
                style={{ ...styles.text, ...styles.cancelButtonText }}
                text="Cancel"
              />
            </Pressable>
            <Pressable
              style={{
                opacity: topicName === '' ? 0.25 : 1,
                backgroundColor: BRAND_COLOR,
                ...styles.button,
              }}
              onPress={handleSubmit}
              disabled={!topicName}
            >
              <ZulipTextIntl
                style={{ ...styles.text, ...styles.submitButtonText }}
                text="Submit"
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
