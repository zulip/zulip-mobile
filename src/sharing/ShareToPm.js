/* @flow strict-local */
import React from 'react';
import { View, Image, ScrollView, Modal, BackHandler } from 'react-native';
import type { NavigationTabProp, NavigationStateRoute } from 'react-navigation-tabs';

import type { Dispatch, SharedData, User, Auth, GetText } from '../types';
import { createStyleSheet } from '../styles';
import { TranslationContext } from '../boot/TranslationProvider';
import { connect } from '../react-redux';
import { ZulipButton, Input, Label } from '../common';
import UserItem from '../users/UserItem';
import { getAuth } from '../selectors';
import { navigateBack } from '../nav/navActions';
import ChooseRecipientsScreen from './ChooseRecipientsScreen';
import { handleSend } from './send';

const styles = createStyleSheet({
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

type Props = $ReadOnly<{|
  // Since we've put this screen in a tab-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the tab-nav shape.
  navigation: NavigationTabProp<{|
    ...NavigationStateRoute,
    params: {| sharedData: SharedData |},
  |}>,

  dispatch: Dispatch,
  auth: Auth,
|}>;

type State = $ReadOnly<{|
  selectedRecipients: User[],
  message: string,
  choosingRecipients: boolean,
  sending: boolean,
|}>;

class ShareToPm extends React.Component<Props, State> {
  static contextType = TranslationContext;
  context: GetText;

  state = (() => {
    const { sharedData } = this.props.navigation.state.params;
    return {
      selectedRecipients: [],
      message: sharedData.type === 'text' ? sharedData.sharedText : '',
      choosingRecipients: false,
      sending: false,
    };
  })();

  handleModalClose = () => {
    this.setState({ choosingRecipients: false });
  };

  setSending = () => {
    this.setState({ sending: true });
  };

  handleChooseRecipients = (selectedRecipients: Array<User>) => {
    this.setState({ selectedRecipients });
    this.setState({ choosingRecipients: false });
  };

  handleSend = async () => {
    const _ = this.context;
    const { auth } = this.props;
    const { sharedData } = this.props.navigation.state.params;
    const { selectedRecipients, message } = this.state;
    const data = { selectedRecipients, message, sharedData, type: 'pm' };

    this.setSending();
    await handleSend(data, auth, _);
    this.finishShare();
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
    const { message, selectedRecipients } = this.state;
    const { sharedData } = this.props.navigation.state.params;

    if (sharedData.type === 'text') {
      return message !== '' && selectedRecipients.length > 0;
    }

    return selectedRecipients.length > 0;
  };

  renderUsersPreview = () => {
    const { selectedRecipients } = this.state;

    if (selectedRecipients.length === 0) {
      return <Label text="Please choose recipients to share with" />;
    }
    const preview = [];
    selectedRecipients.forEach((user: User) => {
      preview.push(<UserItem user={user} onPress={() => {}} key={user.user_id} />);
    });
    return preview;
  };

  render() {
    const { message, choosingRecipients, sending } = this.state;

    if (choosingRecipients) {
      return (
        <Modal onRequestClose={this.handleModalClose}>
          <ChooseRecipientsScreen onComplete={this.handleChooseRecipients} />
        </Modal>
      );
    }

    const { sharedData } = this.props.navigation.state.params;
    let sharePreview = null;
    if (sharedData.type === 'image') {
      sharePreview = (
        <Image
          source={{ uri: sharedData.sharedImageUrl }}
          width={200}
          height={200}
          style={styles.imagePreview}
        />
      );
    }

    return (
      <>
        <ScrollView style={styles.wrapper} keyboardShouldPersistTaps="always">
          <View style={styles.container}>{sharePreview}</View>
          <View style={styles.usersPreview}>{this.renderUsersPreview()}</View>
          <ZulipButton
            onPress={() => this.setState({ choosingRecipients: true })}
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
            progress={sending}
            disabled={!this.isSendButtonEnabled()}
          />
        </View>
      </>
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
}))(ShareToPm);
