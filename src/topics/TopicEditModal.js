// @flow
import React, { useState, useContext, useMemo } from 'react';
import { Modal, Text, Pressable, View, TextInput, Platform } from 'react-native';
import type { JSX$Element } from 'tsflower/subst/react';
import { ThemeContext, BRAND_COLOR, createStyleSheet } from '../styles';
import { updateMessage } from '../api';
import type { Auth, Stream, GetText } from '../types';

type TopicEditModalArgs = {
  topicModalState: {
    visible: boolean,
    topic: string,
    fetchArgs: {
      auth: Auth,
      messageId: number,
      zulipFeatureLevel: number,
    },
  },
  topicModalHandler: {
    startEditTopic: (
      streamId: number,
      topic: string,
      streamsById: Map<number, Stream>,
      _: GetText,
    ) => Promise<void>,
    closeEditTopicModal: () => void,
  },
};

export default function TopicEditModal({
  topicModalState,
  topicModalHandler,
}: TopicEditModalArgs): JSX$Element {
  const { topic, fetchArgs } = topicModalState;
  const [topicState, onChangeTopic] = useState(topic);
  const { closeEditTopicModal } = topicModalHandler;
  const { auth, messageId, zulipFeatureLevel } = fetchArgs;

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
    await updateMessage(auth, messageId, {
      propagate_mode: 'change_all',
      subject: topicState,
      ...(zulipFeatureLevel >= 9 && {
        send_notification_to_old_thread: true,
        send_notification_to_new_thread: true,
      }),
    });
    closeEditTopicModal();
  };
  return (
    <Modal
      transparent
      visible={topicModalState.visible}
      animationType="slide"
      onRequestClose={() => {
        closeEditTopicModal();
      }}
    >
      <View style={styles.wrapper}>
        <View style={styles.modalView}>
          <Text style={styles.titleText}>Edit topic</Text>
          <TextInput
            style={styles.input}
            value={topicState}
            onChangeText={onChangeTopic}
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
              onPress={() => {
                closeEditTopicModal();
              }}
            >
              <Text style={{ ...styles.text, ...styles.cancelButtonText }}>Cancel</Text>
            </Pressable>
            <Pressable
              style={{
                opacity: !topicState ? 0.25 : 1,
                backgroundColor: BRAND_COLOR,
                ...styles.button,
              }}
              onPress={handleSubmit}
              disabled={!topicState}
            >
              <Text style={{ ...styles.text, ...styles.submitButtonText }}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
