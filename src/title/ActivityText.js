/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { UserPresence, UserStatus, Dispatch } from '../types';
import { connectFlowFixMe } from '../react-redux';
import { getPresence, getUserStatus } from '../selectors';
import { presenceToHumanTime } from '../utils/presence';
import { RawLabel } from '../common';

type Props = {
  dispatch: Dispatch,
  presence: UserPresence,
  style: TextStyleProp,
  userStatus: UserStatus,
};

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

export default connectFlowFixMe((state, props) => ({
  presence: getPresence(state)[props.user.email],
  userStatus: getUserStatus(state)[props.user.user_id],
}))(ActivityText);
