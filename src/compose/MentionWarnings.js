/* @flow strict-local */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type {
  Auth,
  Stream,
  Dispatch,
  Narrow,
  UserOrBot,
  Subscription,
  GetText,
  UserId,
} from '../types';
import { TranslationContext } from '../boot/TranslationProvider';
import { getAllUsersById, getAuth } from '../selectors';
import { isPmNarrow } from '../utils/narrow';
import * as api from '../api';
import { showToast } from '../utils/info';

import MentionedUserNotSubscribed from '../message/MentionedUserNotSubscribed';
import { makeUserId } from '../api/idTypes';

type State = {|
  unsubscribedMentions: Array<UserId>,
|};

type SelectorProps = {|
  auth: Auth,
  allUsersById: Map<UserId, UserOrBot>,
|};

type Props = $ReadOnly<{|
  narrow: Narrow,
  stream: Subscription | {| ...Stream, in_home_view: boolean |},

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class MentionWarnings extends PureComponent<Props, State> {
  static contextType = TranslationContext;
  context: GetText;

  state = {
    unsubscribedMentions: [],
  };

  /**
   * Tries to parse a user object from an @-mention.
   *
   * @param completion The autocomplete option chosend by the user.
      See JSDoc for AutoCompleteView for details.
   */
  getUserFromMention = (completion: string): UserOrBot | void => {
    const { allUsersById } = this.props;

    const unformattedMessage = completion.split('**')[1];

    // We skip user groups, for which autocompletes are of the form
    // `*<user_group_name>*`, and therefore, message.split('**')[1]
    // is undefined.
    if (unformattedMessage === undefined) {
      return undefined;
    }

    const [userFullName, userIdRaw] = unformattedMessage.split('|');

    if (userIdRaw !== undefined) {
      const userId = makeUserId(Number.parseInt(userIdRaw, 10));
      return allUsersById.get(userId);
    }

    for (const user of allUsersById.values()) {
      if (user.full_name === userFullName) {
        return user;
      }
    }

    return undefined;
  };

  showSubscriptionStatusLoadError = (mentionedUser: UserOrBot) => {
    const _ = this.context;

    const alertTitle = _('Couldn’t load information about {fullName}', {
      fullName: mentionedUser.full_name,
    });
    showToast(alertTitle);
  };

  /**
   * Check whether the message text entered by the user contains
   * an @-mention to a user unsubscribed to the current stream, and if
   * so, shows a warning.
   *
   * This function is expected to be called by `ComposeBox` using a ref
   * to this component.
   *
   * @param completion The autocomplete option chosend by the user.
      See JSDoc for AutoCompleteView for details.
   */
  handleMentionSubscribedCheck = async (completion: string) => {
    const { narrow, auth, stream } = this.props;
    const { unsubscribedMentions } = this.state;

    if (isPmNarrow(narrow)) {
      return;
    }
    const mentionedUser = this.getUserFromMention(completion);
    if (mentionedUser === undefined || unsubscribedMentions.includes(mentionedUser.user_id)) {
      return;
    }

    let isSubscribed: boolean;
    try {
      isSubscribed = (
        await api.getSubscriptionToStream(auth, mentionedUser.user_id, stream.stream_id)
      ).is_subscribed;
    } catch (err) {
      this.showSubscriptionStatusLoadError(mentionedUser);
      return;
    }

    if (!isSubscribed) {
      this.setState(prevState => ({
        unsubscribedMentions: [...prevState.unsubscribedMentions, mentionedUser.user_id],
      }));
    }
  };

  handleMentionWarningDismiss = (user: UserOrBot) => {
    this.setState(prevState => ({
      unsubscribedMentions: prevState.unsubscribedMentions.filter(x => x !== user.user_id),
    }));
  };

  clearMentionWarnings = () => {
    this.setState({
      unsubscribedMentions: [],
    });
  };

  render() {
    const { unsubscribedMentions } = this.state;
    const { stream, narrow, allUsersById } = this.props;

    if (isPmNarrow(narrow)) {
      return null;
    }

    const mentionWarnings = [];
    for (const userId of unsubscribedMentions) {
      const user = allUsersById.get(userId);

      if (user === undefined) {
        continue;
      }

      mentionWarnings.push(
        <MentionedUserNotSubscribed
          stream={stream}
          user={user}
          onDismiss={this.handleMentionWarningDismiss}
          key={user.user_id}
        />,
      );
    }

    return mentionWarnings;
  }
}

// $FlowFixMe[missing-annot]. TODO: Use a type checked connect call.
export default connect(
  state => ({
    auth: getAuth(state),
    allUsersById: getAllUsersById(state),
  }),
  null,
  null,
  { forwardRef: true },
)(MentionWarnings);
