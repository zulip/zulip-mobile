/* @flow strict-local */
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Modal, View } from 'react-native';
import type { Node } from 'react';

import { useSelector } from '../react-redux';
import styles, { ThemeContext, createStyleSheet } from '../styles';
import * as api from '../api';
import { fetchSomeMessageIdForConversation } from '../message/fetchActions';
import ZulipTextIntl from '../common/ZulipTextIntl';
import ZulipTextButton from '../common/ZulipTextButton';
import Input from '../common/Input';
import { getAuth, getZulipFeatureLevel, getStreamsById, getRealm } from '../selectors';
import { TranslationContext } from '../boot/TranslationProvider';
import { showErrorAlert } from '../utils/info';
import { ensureUnreachable } from '../generics';

type Props = $ReadOnly<{|
  topicModalProviderState: {
    oldTopic: string,
    streamId: number,
  } | null,
  closeEditTopicModal: () => void,
|}>;

export default function TopicEditModal(props: Props): Node {
  const { topicModalProviderState, closeEditTopicModal } = props;

  const auth = useSelector(getAuth);
  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const streamsById = useSelector(getStreamsById);
  const mandatoryTopics = useSelector(state => getRealm(state).mandatoryTopics);
  const _ = useContext(TranslationContext);
  const { backgroundColor } = useContext(ThemeContext);

  const { oldTopic, streamId } = topicModalProviderState || {};

  const [newTopicInputValue, setNewTopicInputValue] = useState<string>(oldTopic);

  // This resets the input value when we enter a new topic-editing session.
  useEffect(() => {
    setNewTopicInputValue(oldTopic);
  }, [oldTopic]);

  const validationErrors = useMemo(() => {
    const result = [];
    if (typeof newTopicInputValue === 'string') {
      const trimmedInput = newTopicInputValue.trim();
      if (mandatoryTopics && trimmedInput === '') {
        result.push('mandatory-topic-empty');
      }
      if (trimmedInput === oldTopic) {
        result.push('user-did-not-edit');
      }
      // Max topic length:
      //   https://zulip.com/api/update-message#parameter-topic
      if (trimmedInput.length > 60) {
        result.push('topic-too-long');
      }
    }
    return result;
  }, [mandatoryTopics, newTopicInputValue, oldTopic]);

  const handleSubmit = async () => {
    if (!topicModalProviderState) {
      throw new Error(_('Topic, streamId, or input value is null.'));
    }
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors
        .map(error => {
          switch (error) {
            case 'mandatory-topic-empty':
              return _('Topic is required in this stream.');
            case 'user-did-not-edit':
              return _("You haven't made any changes.");
            case 'topic-too-long':
              return _('Topic too long (max 60 characters).');
            default:
              ensureUnreachable(error);
              throw new Error();
          }
        })
        .join('\n\n');
      showErrorAlert(errorMessages);
      return;
    }
    try {
      const messageId = await fetchSomeMessageIdForConversation(
        auth,
        streamId,
        oldTopic,
        streamsById,
        zulipFeatureLevel,
      );
      if (messageId == null) {
        throw new Error(
          _('No messages in topic: {streamAndTopic}', {
            streamAndTopic: `#${streamsById.get(streamId)?.name ?? 'unknown'} > ${oldTopic}`,
          }),
        );
      }
      await api.updateMessage(auth, messageId, {
        propagate_mode: 'change_all',
        subject: newTopicInputValue.trim(),
        ...(zulipFeatureLevel >= 9 && {
          send_notification_to_old_thread: true,
          send_notification_to_new_thread: true,
        }),
      });
    } catch (error) {
      showErrorAlert('Failed to edit topic.');
    } finally {
      closeEditTopicModal();
    }
  };

  const modalStyles = createStyleSheet({
    backdrop: {
      position: 'absolute',
      // backgroundColor and opacity aims to match how much our
      // action sheets darken the background when they are toggled.
      backgroundColor: 'black',
      opacity: 0.25,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    wrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      // these values are borrowed from Popup.js
      justifyContent: 'flex-start',
      backgroundColor,
      padding: 15,
      shadowOpacity: 0.5,
      elevation: 8,
      shadowRadius: 16,
      borderRadius: 5,
      width: 280,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    titleText: {
      fontSize: 18,
      lineHeight: 21,
      marginBottom: 10,
      fontWeight: 'bold',
    },
  });

  return (
    <Modal
      transparent
      visible={!!topicModalProviderState}
      animationType="fade"
      onRequestClose={closeEditTopicModal}
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <View style={modalStyles.backdrop} />
      <View style={modalStyles.wrapper}>
        <View style={modalStyles.modal}>
          <ZulipTextIntl style={modalStyles.titleText} text={_('Edit topic')} />
          <Input
            style={styles.marginBottom}
            value={newTopicInputValue}
            placeholder={_('Topic')}
            onChangeText={setNewTopicInputValue}
            selectTextOnFocus
          />
          <View style={modalStyles.buttonContainer}>
            <ZulipTextButton label={_('Cancel')} onPress={closeEditTopicModal} />
            <ZulipTextButton label={_('Submit')} onPress={handleSubmit} leftMargin />
          </View>
        </View>
      </View>
    </Modal>
  );
}
