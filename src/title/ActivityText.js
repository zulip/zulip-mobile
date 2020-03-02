/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { UserPresence, UserStatus, Dispatch, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { getPresence, getUserStatus } from '../selectors';
import { presenceToHumanTime } from '../utils/presence';
import { RawLabel } from '../common';

type SelectorProps = $ReadOnly<{|
  presence: UserPresence,
  userStatus: UserStatus,
|}>;

type Props = $ReadOnly<{|
  style: TextStyleProp,
  user: UserOrBot,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

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

export default connect<SelectorProps, _, _>((state, props) => ({
  presence: getPresence(state)[props.user.email],
  userStatus: getUserStatus(state)[props.user.user_id],
}))(ActivityText);
