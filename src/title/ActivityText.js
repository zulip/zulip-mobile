/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { PresenceState, Style } from '../types';
import { getPresence } from '../selectors';
import { presenceToHumanTime } from '../utils/presence';
import { RawLabel } from '../common';

type Props = {
  email: string,
  color?: string,
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

    return (
      <RawLabel style={[style, color !== undefined && { color }]} text={`Active ${activity}`} />
    );
  }
}

export default connect((state, props) => ({
  presences: getPresence(state),
}))(ActivityText);
