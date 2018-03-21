/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text } from 'react-native';

import connectWithActions from '../connectWithActions';
import { getPresence } from '../selectors';
import { presenceToHumanTime } from '../utils/date';

const styles = StyleSheet.create({
  time: {
    fontSize: 13,
    paddingLeft: 8,
  },
});

type Props = {
  email: string,
  color: string,
  presences: Object,
};

class ActivityText extends PureComponent<Props> {
  render() {
    const { presences, email, color } = this.props;

    if (!presences[email]) {
      return null;
    }

    const activity = presenceToHumanTime(presences[email]);

    return <Text style={[styles.time, { color }]}>Active {activity}</Text>;
  }
}

export default connectWithActions((state, props) => ({
  presences: getPresence(state),
}))(ActivityText);
