/* @flow strict-local */
import React from 'react';
import { View, Modal } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { SharingNavigationProp } from './SharingScreen';
import type { GetText, UserId } from '../types';
import type { SharedData } from './types';
import { createStyleSheet } from '../styles';
import { TranslationContext } from '../boot/TranslationProvider';
import { ZulipButton, Label } from '../common';
import UserItem from '../users/UserItem';
import ChooseRecipientsScreen from './ChooseRecipientsScreen';
import ShareWrapper from './ShareWrapper';

const styles = createStyleSheet({
  usersPreview: {
    padding: 10,
  },
  chooseButton: {
    marginTop: 8,
    marginBottom: 8,
    width: '50%',
    alignSelf: 'flex-end',
  },
});

type Props = $ReadOnly<{|
  navigation: SharingNavigationProp<'share-to-pm'>,
  route: RouteProp<'share-to-pm', {| sharedData: SharedData |}>,
|}>;

type State = $ReadOnly<{|
  selectedRecipients: $ReadOnlyArray<UserId>,
  choosingRecipients: boolean,
|}>;

export default class ShareToPm extends React.Component<Props, State> {
  static contextType = TranslationContext;
  context: GetText;

  state = {
    selectedRecipients: [],
    choosingRecipients: false,
  };

  handleModalClose = () => {
    this.setState({ choosingRecipients: false });
  };

  handleChooseRecipients = (selectedRecipients: $ReadOnlyArray<UserId>) => {
    this.setState({ selectedRecipients });
    this.setState({ choosingRecipients: false });
  };

  isSendButtonEnabled = (message: string) => {
    const { selectedRecipients } = this.state;
    const { sharedData } = this.props.route.params;

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
    selectedRecipients.forEach(userId => {
      preview.push(<UserItem userId={userId} key={userId} />);
    });
    return preview;
  };

  render() {
    const { selectedRecipients, choosingRecipients } = this.state;
    const { sharedData } = this.props.route.params;
    const sendTo = { selectedRecipients, type: 'pm' };

    if (choosingRecipients) {
      return (
        <Modal onRequestClose={this.handleModalClose}>
          <ChooseRecipientsScreen onComplete={this.handleChooseRecipients} />
        </Modal>
      );
    }

    return (
      <ShareWrapper
        isSendButtonEnabled={this.isSendButtonEnabled}
        sharedData={sharedData}
        sendTo={sendTo}
      >
        <View style={styles.usersPreview}>{this.renderUsersPreview()}</View>
        <ZulipButton
          onPress={() => this.setState({ choosingRecipients: true })}
          style={styles.chooseButton}
          text="Choose recipients"
        />
      </ShareWrapper>
    );
  }
}
