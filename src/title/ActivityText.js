/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { Style, UserPresence, UserStatus, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getPresence, getUserStatus } from '../selectors';
import { presenceToHumanTime } from '../utils/presence';
import { RawLabel } from '../common';

type Props = {
  dispatch: Dispatch,
  presence: UserPresence,
  style: Style,
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

export default connect((state, props) => ({
  presence: getPresence(state)[props.user.email],
  userStatus: getUserStatus(state)[props.user.user_id],
}))(ActivityText);
