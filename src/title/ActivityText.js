/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { InjectedDispatch, UserOrBot, UserPresence, UserStatus } from '../types';
import { connect } from '../react-redux';
import { getPresence, getUserStatus } from '../selectors';
import { presenceToHumanTime } from '../utils/presence';
import { RawLabel } from '../common';

type OwnProps = {|
  style: TextStyleProp,
  user: UserOrBot,
|};

type SelectorProps = {|
  presence: UserPresence,
  userStatus: UserStatus,
|};

type Props = {|
  ...InjectedDispatch,
  ...OwnProps,
  ...SelectorProps,
|};

class ActivityText extends PureComponent<Props> {
  render() {
    const { style, presence, userStatus } = this.props;

    if (!presence) {
      return null;
    }

    const activity = presenceToHumanTime(presence, userStatus);

    return <RawLabel style={style} text={`Active ${activity}`} />;
  }
}

export default connect((state, props: OwnProps): SelectorProps => ({
  presence: getPresence(state)[props.user.email],
  userStatus: getUserStatus(state)[props.user.user_id],
}))(ActivityText);
