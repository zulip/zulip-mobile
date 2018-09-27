/* @flow */
import React, { PureComponent } from 'react';
import { View, TextInput, findNodeHandle, Image, FlatList } from 'react-native';
import { connect } from 'react-redux';
import TextInputReset from 'react-native-text-input-reset';

import type {
  Auth,
  Context,
  Narrow,
  EditMessage,
  InputSelectionType,
  User,
  Dispatch,
  Dimensions,
  GlobalState,
  DraftImagesState,
} from '../types';
import {
  addToOutbox,
  cancelEditMessage,
  draftUpdate,
  draftImageAdd,
  draftImageRemove,
  fetchTopicsForActiveStream,
  sendTypingEvent,
} from '../actions';
import { updateMessage, uploadFile } from '../api';
import { FloatingActionButton, Input, MultilineInput } from '../common';
import { showErrorAlert } from '../utils/info';
import { IconDone, IconSend, IconCross } from '../common/Icons';
import { isStreamNarrow, isStreamOrTopicNarrow, topicNarrow } from '../utils/narrow';
import ComposeMenu, { handleImagePickerError } from './ComposeMenu';
import AutocompleteViewWrapper from '../autocomplete/AutocompleteViewWrapper';
import getComposeInputPlaceholder from './getComposeInputPlaceholder';
import NotSubscribed from '../message/NotSubscribed';
import AnnouncementOnly from '../message/AnnouncementOnly';

import {
  getAuth,
  getIsAdmin,
  getSession,
  canSendToActiveNarrow,
  getLastMessageTopic,
  getActiveUsers,
  getShowMessagePlaceholders,
} from '../selectors';
import {
  getIsActiveStreamSubscribed,
  getIsActiveStreamAnnouncementOnly,
} from '../subscriptions/subscriptionSelectors';
import { getDraftForActiveNarrow } from '../drafts/draftsSelectors';
import { getDraftImageData } from '../draftImages/draftImagesSelectors';

type Props = {
  auth: Auth,
  canSend: boolean,
  narrow: Narrow,
  users: User[],
  draft: string,
  draftImages: DraftImagesState,
  lastMessageTopic: string,
  isAdmin: boolean,
  isAnnouncementOnly: boolean,
  isSubscribed: boolean,
  editMessage: EditMessage,
  safeAreaInsets: Dimensions,
  dispatch: Dispatch,
};

type State = {
  isMessageFocused: boolean,
  isTopicFocused: boolean,
  isMenuExpanded: boolean,
  topic: string,
  message: string,
  height: number,
  selection: InputSelectionType,
};

export const updateTextInput = (textInput: ?TextInput, text: string): void => {
  if (!textInput) {
    // Depending on the lifecycle events this function is called from,
    // this might not be set yet.
    return;
  }

  textInput.setNativeProps({ text });

  if (text.length === 0 && TextInputReset) {
    // React Native has problems with some custom keyboards when clearing
    // the input's contents.  Force reset to make sure it works.
    TextInputReset.resetKeyboardInput(findNodeHandle(textInput));
  }
};

class ComposeBox extends PureComponent<Props, State> {
  context: Context;
  props: Props;
  state: State;

  messageInput: ?TextInput = null;
  topicInput: ?TextInput = null;

  static contextTypes = {
    styles: () => null,
  };

  state = {
    isMessageFocused: false,
    isTopicFocused: false,
    isMenuExpanded: false,
    height: 20,
    topic: '',
    message: this.props.draft,
    selection: { start: 0, end: 0 },
  };

  getCanSelectTopic = () => {
    const { isMessageFocused, isTopicFocused } = this.state;
    const { editMessage, narrow, draftImages } = this.props;
    if (editMessage) {
      return isStreamOrTopicNarrow(narrow);
    }
    if (!isStreamNarrow(narrow)) {
      return false;
    }
    const hasImages = Boolean(Object.keys(draftImages).length);
    return isMessageFocused || isTopicFocused || hasImages;
  };

  setMessageInputValue = (message: string) => {
    updateTextInput(this.messageInput, message);
    this.handleMessageChange(message);
  };

  setTopicInputValue = (topic: string) => {
    updateTextInput(this.topicInput, topic);
    this.handleTopicChange(topic);
  };

  handleComposeMenuToggle = () => {
    this.setState(({ isMenuExpanded }) => ({
      isMenuExpanded: !isMenuExpanded,
    }));
  };

  handleImageSelect = (imageEventObj: Object) => {
    const { dispatch, response } = imageEventObj;
    if (!response.images || !response.images.length) {
      return;
    }
    const newTopic = this.state.topic || this.props.lastMessageTopic;
    response.images.forEach(image => {
      dispatch(draftImageAdd(image.uri, image.fileName, image.uri));
    });
    setTimeout(() => {
      this.setTopicInputValue(newTopic);
    }, 200); // wait, to hope the component is shown
  };
  handleRemoveDraftImage = (id: string) => {
    const { dispatch } = this.props;
    dispatch(draftImageRemove(id));
  };
  handleLayoutChange = (event: Object) => {
    this.setState({
      height: event.nativeEvent.layout.height,
    });
  };

  handleTopicChange = (topic: string) => {
    this.setState({ topic, isMenuExpanded: false });
  };

  handleTopicAutocomplete = (topic: string) => {
    this.setTopicInputValue(topic);
  };

  handleMessageChange = (message: string) => {
    this.setState({ message, isMenuExpanded: false });
    const { dispatch, narrow } = this.props;
    dispatch(sendTypingEvent(narrow));
    dispatch(draftUpdate(narrow, message));
  };

  handleMessageAutocomplete = (message: string) => {
    this.setMessageInputValue(message);
  };

  handleMessageSelectionChange = (event: Object) => {
    const { selection } = event.nativeEvent;
    this.setState({ selection });
  };

  handleMessageFocus = () => {
    const { topic } = this.state;
    const { lastMessageTopic } = this.props;
    this.setState({
      isMessageFocused: true,
      isMenuExpanded: false,
    });
    setTimeout(() => {
      this.setTopicInputValue(topic || lastMessageTopic);
    }, 200); // wait, to hope the component is shown
  };

  handleMessageBlur = () => {
    setTimeout(() => {
      this.setState({
        isMessageFocused: false,
        isMenuExpanded: false,
      });
    }, 200); // give a chance to the topic input to get the focus
  };

  handleTopicFocus = () => {
    const { dispatch, narrow } = this.props;
    this.setState({
      isTopicFocused: true,
      isMenuExpanded: false,
    });
    dispatch(fetchTopicsForActiveStream(narrow));
  };

  handleTopicBlur = () => {
    setTimeout(() => {
      this.setState({
        isTopicFocused: false,
        isMenuExpanded: false,
      });
    }, 200); // give a chance to the message input to get the focus
  };

  handleInputTouchStart = () => {
    this.setState({ isMenuExpanded: false });
  };

  getDestinationNarrow = (): Narrow => {
    const { narrow } = this.props;
    const { topic } = this.state;
    return isStreamNarrow(narrow) ? topicNarrow(narrow[0].operand, topic || '(no topic)') : narrow;
  };

  uploadAllDrafts = () => {
    const { dispatch, draftImages, auth } = this.props;
    const messageUriArr = [];
    const imageIds = Object.keys(draftImages);
    imageIds.forEach(id => {
      const imageObj = draftImages[id];
      const uriPromise = new Promise(async (resolve, reject) => {
        try {
          const remoteUri = await uploadFile(auth, imageObj.uri, imageObj.fileName);
          resolve(`[${imageObj.fileName}](${remoteUri})`);
          dispatch(draftImageRemove(id));
        } catch (e) {
          reject(e);
        }
      });
      messageUriArr.push(uriPromise);
    });
    return Promise.all(messageUriArr);
  };

  getFormattedMessage = async (message?: string): Promise<any> => {
    let draftImages = [];
    message = message != null ? message : '';
    try {
      draftImages = await this.uploadAllDrafts();
    } catch (e) {
      throw e;
    }
    if (!draftImages.length) {
      return message;
    }
    return `${message}\n${draftImages.join('\n')}`;
  };

  handleSend = () => {
    const { dispatch } = this.props;
    const { message } = this.state;

    this.getFormattedMessage(message)
      .then(formattedMsg => {
        if (formattedMsg.length) {
          dispatch(addToOutbox(this.getDestinationNarrow(), formattedMsg));
        }
        this.setMessageInputValue('');
      })
      .catch(e => {
        showErrorAlert('Error', e.toString());
      });
  };

  handleEdit = () => {
    const { auth, editMessage, dispatch } = this.props;
    const { message, topic } = this.state;
    const content = editMessage.content !== message ? message : undefined;
    const subject = topic !== editMessage.topic ? topic : undefined;
    if (content || subject) {
      updateMessage(auth, { content, subject }, editMessage.id).catch(error => {
        showErrorAlert(error.message, 'Failed to edit message');
      });
    }
    dispatch(cancelEditMessage());
  };

  componentDidMount() {
    const { message, topic } = this.state;

    updateTextInput(this.messageInput, message);
    updateTextInput(this.topicInput, topic);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.editMessage !== this.props.editMessage) {
      const topic =
        isStreamNarrow(nextProps.narrow) && nextProps.editMessage
          ? nextProps.editMessage.topic
          : '';
      const message = nextProps.editMessage ? nextProps.editMessage.content : '';
      this.setMessageInputValue(message);
      this.setTopicInputValue(topic);
      if (this.messageInput) {
        this.messageInput.focus();
      }
    }
  }

  render() {
    const { styles } = this.context;
    const { isTopicFocused, isMenuExpanded, height, message, topic, selection } = this.state;
    const {
      auth,
      canSend,
      narrow,
      users,
      editMessage,
      safeAreaInsets,
      isAdmin,
      isAnnouncementOnly,
      isSubscribed,
      draftImages,
    } = this.props;

    const { handleRemoveDraftImage } = this;

    if (!isSubscribed) {
      return <NotSubscribed narrow={narrow} />;
    } else if (isAnnouncementOnly && !isAdmin) {
      return <AnnouncementOnly />;
    }

    const placeholder = getComposeInputPlaceholder(narrow, auth.email, users);
    const style = {
      marginBottom: safeAreaInsets.bottom,
      ...(canSend ? {} : { opacity: 0, position: 'absolute' }),
    };
    const renderImagePreview = ({ item }) => {
      const { key } = item;
      return (
        <View style={styles.composeImageContainer} key={key}>
          <FloatingActionButton
            style={styles.composeImageDeleteButton}
            Icon={IconCross}
            size={25}
            disabled={false}
            imageId={key}
            onPress={() => handleRemoveDraftImage(key)}
          />
          <Image
            style={styles.composeImage}
            resizeMode="cover"
            source={{ isStatic: true, uri: draftImages[key].uri }}
          />
        </View>
      );
    };
    const imagePreviewData = Object.keys(draftImages).map(id => ({ key: id }));
    const numberOfDraftImages = Object.keys(draftImages).length;
    return (
      <View style={style}>
        <AutocompleteViewWrapper
          composeText={message}
          isTopicFocused={isTopicFocused}
          marginBottom={height}
          messageSelection={selection}
          narrow={narrow}
          topicText={topic}
          onMessageAutocomplete={this.handleMessageAutocomplete}
          onTopicAutocomplete={this.handleTopicAutocomplete}
        />
        <View style={styles.composeBox} onLayout={this.handleLayoutChange}>
          <View style={styles.alignBottom}>
            <ComposeMenu
              destinationNarrow={this.getDestinationNarrow()}
              expanded={isMenuExpanded}
              onExpandContract={this.handleComposeMenuToggle}
              onImageSelect={this.handleImageSelect}
              onImageError={handleImagePickerError}
              disableCamera={numberOfDraftImages >= 1}
              disableUpload={numberOfDraftImages >= 1}
            />
          </View>
          <View style={styles.composeText}>
            {this.getCanSelectTopic() && (
              <Input
                style={styles.topicInput}
                underlineColorAndroid="transparent"
                placeholder="Topic"
                selectTextOnFocus
                textInputRef={component => {
                  this.topicInput = component;
                }}
                onChangeText={this.handleTopicChange}
                onFocus={this.handleTopicFocus}
                onBlur={this.handleTopicBlur}
                onTouchStart={this.handleInputTouchStart}
              />
            )}
            <FlatList
              data={imagePreviewData}
              contentContainerStyle={styles.composeImages}
              numColumns={2}
              renderItem={renderImagePreview}
            />
            <MultilineInput
              style={styles.composeTextInput}
              placeholder={placeholder}
              textInputRef={component => {
                if (component) {
                  this.messageInput = component;
                }
              }}
              onBlur={this.handleMessageBlur}
              onChange={this.handleMessageChange}
              onFocus={this.handleMessageFocus}
              onSelectionChange={this.handleMessageSelectionChange}
              onTouchStart={this.handleInputTouchStart}
            />
          </View>
          <View style={styles.alignBottom}>
            <FloatingActionButton
              style={styles.composeSendButton}
              Icon={editMessage === null ? IconSend : IconDone}
              size={32}
              disabled={message.trim().length === 0 && numberOfDraftImages === 0}
              onPress={editMessage === null ? this.handleSend : this.handleEdit}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default connect((state: GlobalState, props) => ({
  auth: getAuth(state),
  users: getActiveUsers(state),
  safeAreaInsets: getSession(state).safeAreaInsets,
  isAdmin: getIsAdmin(state),
  isAnnouncementOnly: getIsActiveStreamAnnouncementOnly(props.narrow)(state),
  isSubscribed: getIsActiveStreamSubscribed(props.narrow)(state),
  canSend: canSendToActiveNarrow(props.narrow) && !getShowMessagePlaceholders(props.narrow)(state),
  editMessage: getSession(state).editMessage,
  draft: getDraftForActiveNarrow(props.narrow)(state),
  draftImages: getDraftImageData(state),
  lastMessageTopic: getLastMessageTopic(props.narrow)(state),
}))(ComposeBox);
