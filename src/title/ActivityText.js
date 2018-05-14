/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';

import type { PresenceState, Style } from '../types';
import connectWithActions from '../connectWithActions';
import { getPresence } from '../selectors';
import { presenceToHumanTime } from '../utils/presence';

type Props = {
  email: string,
  color: string,
  presences: PresenceState,
  style: Style,
};

class ActivityText extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { style, presences, email, color } = this.props;

    if (!presences[email]) {
      return null;
    }

    const activity = presenceToHumanTime(presences[email]);

    return <Text style={[style, { color }]}>Active {activity}</Text>;
  }
}

export default connectWithActions((state, props) => ({
  presences: getPresence(state),
}))(ActivityText);
