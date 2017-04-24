import React from 'react';
import { Clipboard } from 'react-native';
import ActionSheet from 'react-native-actionsheet';

import { narrowFromMessage } from '../utils/narrow';
import { getSingleMessage } from '../api';

const actionButtons = [
  'Narrow to conversation',
  'Reply',
  'Copy to clipboard',
  'Cancel'
];

class MessageActionSheet extends React.PureComponent {

  narrowToConversation = () => {
    const { message, doNarrow } = this.props;
    doNarrow(narrowFromMessage(message), message.id);
  };

  reply = () => {
    const { message, doNarrow } = this.props;
    doNarrow(narrowFromMessage(message), message.id);
  };

  copyToClipboard = () => {
    const { message, auth } = this.props;
    const copy = async () => {
      const rawMessage = await getSingleMessage(auth, message.id);
      Clipboard.setString(rawMessage.raw_content);
    };
    copy();
  };

  handleActionSheetPress = (buttonIndex) => {
    const cancel = () => {};
    [
      this.narrowToConversation,
      this.reply,
      this.copyToClipboard,
      cancel
    ][buttonIndex]();
    this.props.close();
  };

  render() {
    const { show } = this.props;

    if (show) {
      this.ActionSheet.show();
    }
    return (
      <ActionSheet
        ref={(o) => (this.ActionSheet = o)}
        options={actionButtons}
        onPress={this.handleActionSheetPress}
        cancelButtonIndex={actionButtons.length - 1}
      />
    );
  }
}

export default MessageActionSheet;
