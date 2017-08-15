/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, Text } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import { nullFunction } from '../nullObjects';
import MessageContainer from './MessageContainer';
import TaggedView from '../native/TaggedView';
import renderMessages from './renderMessages';
import { getFullUrl } from '../utils/url';
import {
  constructActionButtons,
  executeActionSheetAction,
  constructHeaderActionButtons,
} from './messageActionSheet';

class MessageList extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  autoScrollToBottom = false;

  static defaultProps = {
    onScroll: nullFunction,
  };

  componentWillReceiveProps(nextProps) {
    this.autoScrollToBottom = this.props.caughtUpNewer && nextProps.caughtUpNewer;
  }

  handleHeaderLongPress = message => {
    const { actions, subscriptions, mute, auth } = this.props;
    const options = constructHeaderActionButtons({ message, subscriptions, mute });
    const callback = buttonIndex => {
      executeActionSheetAction({
        actions,
        title: options[buttonIndex],
        message,
        header: true,
        auth,
        subscriptions,
      });
    };
    this.showActionSheet({ options, cancelButtonIndex: options.length - 1, callback });
  };

  showActionSheet = ({ options, cancelButtonIndex, callback }) => {
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      callback,
    );
  };

  handleLongPress = message => {
    const { auth, narrow, subscriptions, mute, flags, actions } = this.props;
    const options = constructActionButtons({ message, auth, narrow, subscriptions, mute, flags });
    const callback = buttonIndex => {
      executeActionSheetAction({
        title: options[buttonIndex],
        message,
        actions,
        auth,
        subscriptions,
      });
    };
    this.showActionSheet({ options, cancelButtonIndex: options.length - 1, callback });
  };

  render() {
    const { styles } = this.context;
    const {
      auth,
      actions,
      subscriptions,
      users,
      messages,
      narrow,
      mute,
      doNarrow,
      flags,
      twentyFourHourTime,
    } = this.props;

    const messageList = renderMessages({
      onLongPress: this.handleLongPress,
      onHeaderLongPress: this.handleHeaderLongPress,
      auth,
      actions,
      subscriptions,
      users,
      messages,
      narrow,
      mute,
      flags,
      twentyFourHourTime,
    });

    // `headerIndices` tell the scroll view which components are headers
    // and are eligible to be docked at the top of the view.
    const headerIndices = [];
    for (let i = 0; i < messageList.length; i++) {
      const elem = messageList[i];
      if (elem.props.type === 'header') {
        headerIndices.push(i + 1);
      }
      if (elem.props.type === 'message') {
        messageList[i] = (
          <TaggedView
            key={elem.props.message.id}
            tagID={elem.props.message.id.toString()}
            collapsable={false}>
            {elem}
          </TaggedView>
        );
      }
    }

    return (
      <FlatList
        style={styles.messageList}
        enableEmptySections
        sections={[]}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) =>
          <MessageContainer
            auth={auth}
            actions={actions}
            message={item}
            isBrief={false}
            flags={flags}
            doNarrow={doNarrow}
            avatarUrl={getFullUrl(item.avatar_url, auth.realm)}
            users={users}
            onLongPress={this.handleLongPress}
          />}
        renderSectionHeader={({ section }) =>
          <Text style={styles.groupHeader}>
            {section.key}
          </Text>}
      />
    );
  }
}

export default connectActionSheet(MessageList);
