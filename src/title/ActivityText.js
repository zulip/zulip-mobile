/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { UserPresence, Style } from '../types';
import { getPresence } from '../selectors';
import { presenceToHumanTime } from '../utils/presence';
import { RawLabel } from '../common';

type Props = {
  color?: string,
  presence: UserPresence,
  style: Style,
};

class ActivityText extends PureComponent<Props> {
  render() {
    const { style, presence, color } = this.props;

    if (!presence) {
      return null;
    }

    const activity = presenceToHumanTime(presence);

    const activityText = {
      active: `Active ${activity}`,
      idle: `Idle ${activity}`,
      offline: null,
    };

    const text = activityText[presence.aggregated.status];

    if (text === null) {
      return null;
    }

    return <RawLabel style={[style, color !== undefined && { color }]} text={text} />;
  }
}

export default connect((state, props) => ({
  presence: getPresence(state)[props.email],
}))(ActivityText);
