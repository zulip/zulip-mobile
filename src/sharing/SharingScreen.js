/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet, Image, ScrollView, Modal, BackHandler } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation';
import { BRAND_COLOR } from '../styles/constants';
import type { Dispatch, SharedData, Subscription, User, Auth } from '../types';
import { connect } from '../react-redux';
import { ZulipButton, Input, Label, Screen } from '../common';
import UserItem from '../users/UserItem';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import StreamAutocomplete from '../autocomplete/StreamAutocomplete';
import TopicAutocomplete from '../autocomplete/TopicAutocomplete';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import ChooseRecipientsScreen from './ChooseRecipientsScreen';
import { sendMessage, uploadFile } from '../api';
import { streamNarrow } from '../utils/narrow';
import { getAuth } from '../selectors';
import { showToast } from '../utils/info';
import { navigateBack } from '../nav/navActions';
import { fetchTopicsForActiveStream } from '../topics/topicActions';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 10,
  },
  imagePreview: {
    margin: 10,
    borderRadius: 5,
    width: 200,
    height: 200,
  },
  container: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    margin: 8,
  },
  usersPreview: {
    padding: 10,
  },
  sharingWith: {
    fontSize: 16,
    marginBottom: 10,
  },
  chooseButton: {
    marginTop: 8,
    marginBottom: 8,
    width: '50%',
    alignSelf: 'flex-end',
  },
  message: {
    height: 70,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'whitesmoke',
    padding: 5,
  },
});

type ShareToStreamProps = $ReadOnly<{|
  share: SharedData,
  dispatch: Dispatch,
  subscriptions: Map<number, Subscription>,
  auth: Auth,
|}>;

type ShareToStreamState = $ReadOnly<{|
  stream: string,
  topic: string,
  message: string,
  isStreamFocused: boolean,
  isTopicFocused: boolean,
|}>;

class ShareToStreamComponent extends React.Component<ShareToStreamProps, ShareToStreamState> {
  state = {
    stream: '',
    topic: '',
    message: this.props.share.sharedText || '',
    isStreamFocused: false,
    isTopicFocused: false,
  };

  blurStream = () => {
    this.setState({ isStreamFocused: false });
  };

  focusStream = () => {
    this.setState({ isStreamFocused: true });
  };

  blurTopic = () => {
    this.setState({ isTopicFocused: false });
  };

  focusTopic = () => {
    const { stream } = this.state;
    const { dispatch } = this.props;
    const narrow = streamNarrow(stream);

    dispatch(fetchTopicsForActiveStream(narrow));
    this.setState({ isTopicFocused: true });
  };

  handleMessageChange = message => {
    this.setState({ message });
  };

  handleStreamChange = stream => {
    this.setState({ stream });
  };

  handleTopicChange = topic => {
    this.setState({ topic });
  };

  handleStreamAutoComplete = (rawStream: string) => {
    const stream = rawStream.split('**')[1];
    this.setState({ stream, isStreamFocused: false });
  };

  handleTopicAutoComplete = (topic: string) => {
    this.setState({ topic });
  };

  finishShare = () => {
    const { dispatch } = this.props;

    dispatch(navigateBack());
    BackHandler.exitApp();
  };

  isSendButtonEnabled = () => {
    const { stream, topic, message } = this.state;
    const { share } = this.props;

    if (share.type !== 'text') {
      return stream !== '' && topic !== '';
    }

    return stream !== '' && topic !== '' && message !== '';
  };

  handleSend = async () => {
    const { topic, stream, message } = this.state;
    let messageToSend = message;
    const { auth, share } = this.props;

    try {
      showToast('Sending Message...');
      if (share.type !== 'text') {
        const uri = share.type === 'image' ? share.sharedImageUri : share.sharedFileUri;
        const fileName = uri.split('/').pop();
        const response = await uploadFile(auth, uri, fileName);
        messageToSend += `\n[${fileName}](${response.uri})`;
      }
      await sendMessage(auth, {
        content: messageToSend,
        type: 'stream',
        subject: topic,
        to: stream,
      });
    } catch (err) {
      showToast('Failed to send message');
      this.finishShare();
    }
    showToast('Message sent');
    this.finishShare();
  };

  render() {
    const { share } = this.props;
    const { stream, topic, message, isStreamFocused, isTopicFocused } = this.state;
    const narrow = streamNarrow(stream);

    return (
      <>
        <ScrollView style={styles.wrapper} keyboardShouldPersistTaps>
          <View style={styles.container}>
            {share.type === 'image' && (
              <Image
                source={{ uri: share.sharedImageUri }}
                width={200}
                height={200}
                style={styles.imagePreview}
              />
            )}
            <AnimatedScaleComponent visible={isStreamFocused}>
              <StreamAutocomplete filter={stream} onAutocomplete={this.handleStreamAutoComplete} />
            </AnimatedScaleComponent>
            <Input
              placeholder="Stream"
              value={stream}
              onChangeText={this.handleStreamChange}
              onFocus={this.focusStream}
              onChange={this.focusStream}
              onBlur={this.blurStream}
              selectTextOnFocus
            />
            <View />
            <AnimatedScaleComponent visible={isTopicFocused}>
              <TopicAutocomplete
                text={topic}
                onAutocomplete={this.handleTopicAutoComplete}
                isFocused={isTopicFocused}
                narrow={narrow}
              />
            </AnimatedScaleComponent>
            <Input
              placeholder="Topic"
              value={topic}
              onFocus={this.focusTopic}
              onBlur={this.blurTopic}
              onChangeText={this.handleTopicChange}
              editable={stream !== ''}
            />
            <Input
              placeholder="Message"
              value={message}
              onChangeText={this.handleMessageChange}
              multiline
            />
          </View>
        </ScrollView>
        <View style={styles.actions}>
          <ZulipButton onPress={this.finishShare} style={styles.button} secondary text="Cancel" />
          <ZulipButton
            style={styles.button}
            onPress={this.handleSend}
            text="Send"
            disabled={!this.isSendButtonEnabled()}
          />
        </View>
      </>
    );
  }
}

type ShareToPmProps = $ReadOnly<{|
  share: SharedData,
  dispatch: Dispatch,
  auth: Auth,
|}>;

type ShareToPmState = $ReadOnly<{|
  users: User[],
  message: string,
  choosingRecipients: boolean,
|}>;

class ShareToPmComponent extends React.Component<ShareToPmProps, ShareToPmState> {
  constructor(props) {
    super(props);
    const { share } = props;
    this.state = {
      users: [],
      message: share.type === 'text' ? share.sharedText : '',
      choosingRecipients: false,
    };
  }

  toggleChoosingRecipients = () => {
    this.setState(state => ({ choosingRecipients: !state.choosingRecipients }));
  };

  handleChooseRecipients = (users: Array<User>) => {
    this.setState({ users });
    this.toggleChoosingRecipients();
  };

  finishShare = () => {
    const { dispatch } = this.props;

    dispatch(navigateBack());
    BackHandler.exitApp();
  };

  handleMessageChange = message => {
    this.setState({ message });
  };

  isSendButtonEnabled = () => {
    const { message, users } = this.state;
    const { share } = this.props;

    if (share.type === 'text') {
      return message !== '' && users.length > 0;
    }

    return users.length > 0;
  };

  getUsersPreview = () => {
    const { users } = this.state;

    if (users.length === 0) {
      return <Label text="Please choose recipients to share with" />;
    }
    const preview = [];
    users.forEach((user: User) => {
      preview.push(
        <UserItem
          avatarUrl={user.avatar_url}
          email={user.email}
          fullName={user.full_name}
          onPress={() => {}}
        />,
      );
    });
    return preview;
  };

  handleSend = async () => {
    const { users, message } = this.state;
    let messageToSend = message;
    const { auth, share } = this.props;
    const to = JSON.stringify(users.map(user => user.user_id));

    try {
      showToast('Sending Message...');

      if (share.type === 'image' || share.type === 'file') {
        const uri = share.type === 'image' ? share.sharedImageUri : share.sharedFileUri;
        const fileName = uri.split('/').pop();
        const response = await uploadFile(auth, uri, fileName);
        messageToSend += `\n[${fileName}](${response.uri})`;
      }
      await sendMessage(auth, { content: messageToSend, type: 'private', to });
    } catch (err) {
      showToast('Failed to send message');
      this.finishShare();
      return;
    }

    showToast('Message sent');
    this.finishShare();
  };

  render() {
    const { message, choosingRecipients } = this.state;

    if (choosingRecipients) {
      return (
        <Modal>
          <ChooseRecipientsScreen onComplete={this.handleChooseRecipients} />
        </Modal>
      );
    }

    const { share } = this.props;
    let sharePreview = null;
    if (share.type === 'image') {
      sharePreview = (
        <Image
          source={{ uri: share.sharedImageUri }}
          width={200}
          height={200}
          style={styles.imagePreview}
        />
      );
    }

    return (
      <>
        <ScrollView style={styles.wrapper} keyboardShouldPersistTaps>
          <View style={styles.container}>{sharePreview}</View>
          <View style={styles.usersPreview}>{this.getUsersPreview()}</View>
          <ZulipButton
            onPress={this.toggleChoosingRecipients}
            style={styles.chooseButton}
            text="Choose recipients"
          />
          <Input
            value={message}
            placeholder="Message"
            onChangeText={this.handleMessageChange}
            multiline
          />
        </ScrollView>
        <View style={styles.actions}>
          <ZulipButton onPress={this.finishShare} style={styles.button} secondary text="Cancel" />
          <ZulipButton
            style={styles.button}
            onPress={this.handleSend}
            text="Send"
            disabled={!this.isSendButtonEnabled()}
          />
        </View>
      </>
    );
  }
}

const ShareToPm = connect(state => ({
  auth: getAuth(state),
}))(ShareToPmComponent);

const ShareToStream = connect(state => ({
  subscriptions: getSubscriptionsById(state),
  auth: getAuth(state),
}))(ShareToStreamComponent);

type Props = $ReadOnly<{|
  navigation: NavigationScreenProp<{ params: {| sharedData: SharedData |} }>,
  dispatch: Dispatch,
|}>;

class SharingScreen extends PureComponent<Props> {
  Tabs;

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    const share: SharedData = navigation.state.params.sharedData;

    this.Tabs = createMaterialTopTabNavigator(
      {
        Stream: {
          screen: () => <ShareToStream share={share} />,
        },
        'Private Message': {
          screen: () => <ShareToPm share={share} />,
        },
      },
      {
        tabBarPosition: 'top',
        animationEnabled: true,
        tabBarOptions: {
          upperCaseLabel: false,
          pressColor: BRAND_COLOR,
          activeTintColor: BRAND_COLOR,
          inactiveTintColor: 'gray',
          labelStyle: {
            fontSize: 14,
            margin: 0,
            padding: 10,
          },
          indicatorStyle: {
            backgroundColor: BRAND_COLOR,
          },
          tabStyle: {
            flex: 1,
          },
          style: {
            backgroundColor: 'transparent',
            borderWidth: 0,
            elevation: 0,
          },
        },
      },
    );
  }

  render() {
    const { Tabs } = this;

    return (
      <Screen canGoBack={false} title="Share on Zulip" shouldShowLoadingBanner={false}>
        <Tabs />
      </Screen>
    );
  }
}

export default connect()(SharingScreen);
