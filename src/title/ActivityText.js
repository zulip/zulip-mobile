/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Style, UserOrBot, UserPresence, UserStatus } from '../types';
import { getPresence, getUserStatus } from '../selectors';
import { presenceToHumanTime } from '../utils/presence';
import { RawLabel } from '../common';

type OwnProps = {|
  style: Style,
  user: UserOrBot,
|};

type StateProps = {|
  presence: UserPresence,
  userStatus: UserStatus,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
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

export default connect((state, props) => ({
  presence: getPresence(state)[props.user.email],
  userStatus: getUserStatus(state)[props.user.user_id],
}))(ActivityText);
