/* @flow strict-local */
import React from 'react';
import type { Node, Context } from 'react';
import { View, Modal } from 'react-native';

import type { ValidationError } from './ShareWrapper';
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
  static contextType: Context<GetText> = TranslationContext;
  context: GetText;

  state: State = {
    selectedRecipients: [],
    choosingRecipients: false,
  };

  handleModalClose: () => void = () => {
    this.setState({ choosingRecipients: false });
  };

  handleChooseRecipients: ($ReadOnlyArray<UserId>) => void = selectedRecipients => {
    this.setState({ selectedRecipients });
    this.setState({ choosingRecipients: false });
  };

  getValidationErrors: string => $ReadOnlyArray<ValidationError> = message => {
    const { selectedRecipients } = this.state;
    const { sharedData } = this.props.route.params;

    const result = [];

    if (selectedRecipients.length === 0) {
      result.push('recipients-empty');
    }

    if (sharedData.type === 'text' && message === '') {
      result.push('message-empty');
    }

    return result;
  };

  renderUsersPreview: () => Node = () => {
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

  render(): Node {
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
        getValidationErrors={this.getValidationErrors}
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
