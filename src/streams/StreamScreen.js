/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import type { Context, Dispatch, GlobalState, Stream, Subscription } from '../types';
import { OptionRow, Screen, ZulipButton, OptionDivider } from '../common';
import { getIsAdmin, getStreamFromId, getSubscriptionFromId } from '../selectors';
import StreamCard from './StreamCard';
import {
  doToggleMuteStream,
  doTogglePinStream,
  navigateToEditStream,
  navigateToTopicList,
  toggleStreamNotification,
  navigateToStreamSubscribers,
} from '../actions';

type Props = {
  dispatch: Dispatch,
  isAdmin: boolean,
  stream: Stream,
  subscription: Subscription,
};

class StreamScreen extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };
  handleTogglePinStream = (newValue: boolean) => {
    const { dispatch, stream } = this.props;
    dispatch(doTogglePinStream(stream.stream_id, newValue));
  };

  handleToggleMuteStream = (newValue: boolean) => {
    const { dispatch, stream } = this.props;
    dispatch(doToggleMuteStream(stream.stream_id, newValue));
  };

  handleTopics = () => {
    const { dispatch, stream } = this.props;
    dispatch(navigateToTopicList(stream.stream_id));
  };

  handleEdit = () => {
    const { dispatch, stream } = this.props;
    dispatch(navigateToEditStream(stream.stream_id));
  };

  handleEditSubscribers = () => {
    const { dispatch, stream } = this.props;
    dispatch(navigateToStreamSubscribers(stream.stream_id));
  };

  toggleStreamPushNotification = () => {
    const { dispatch, subscription, stream } = this.props;
    dispatch(toggleStreamNotification(stream.stream_id, !subscription.push_notifications));
  };

  render() {
    const { isAdmin, stream, subscription } = this.props;
    const { styles } = this.context;

    return (
      <Screen title="Stream">
        <StreamCard stream={stream} subscription={subscription} />
        <OptionRow
          label="Pinned"
          defaultValue={subscription.pin_to_top}
          onValueChange={this.handleTogglePinStream}
        />
        <OptionRow
          label="Muted"
          defaultValue={subscription.in_home_view === false}
          onValueChange={this.handleToggleMuteStream}
        />
        <OptionRow
          label="Notifications"
          defaultValue={subscription.push_notifications}
          onValueChange={this.toggleStreamPushNotification}
          customStyle={this.context.styles.backgroundColor}
        />
        <OptionDivider />
        <View style={styles.padding}>
          <ZulipButton text="Topics" onPress={this.handleTopics} />
          {isAdmin && (
            <ZulipButton style={styles.marginTop} text="Edit" onPress={this.handleEdit} />
          )}
          {isAdmin && (
            <ZulipButton
              style={styles.marginTop}
              text="Add subscribers"
              onPress={this.handleEditSubscribers}
            />
          )}
        </View>
      </Screen>
    );
  }
}

export default connect((state: GlobalState, props: Object) => ({
  isAdmin: getIsAdmin(state),
  stream: getStreamFromId(props.navigation.state.params.streamId)(state),
  subscription: getSubscriptionFromId(props.navigation.state.params.streamId)(state),
}))(StreamScreen);
