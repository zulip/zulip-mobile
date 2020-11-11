/* @flow strict-local */

import React, { PureComponent } from 'react';

import NavigationService from '../nav/NavigationService';
import type { Dispatch, Narrow, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { getRecipientsInGroupNarrow } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToGroupDetails } from '../actions';

type SelectorProps = {|
  recipients: UserOrBot[],
|};

type Props = $ReadOnly<{|
  color: string,
  narrow: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class InfoNavButtonGroup extends PureComponent<Props> {
  handlePress = () => {
    const { recipients } = this.props;
    NavigationService.dispatch(navigateToGroupDetails(recipients));
  };

  render() {
    const { color } = this.props;

    return <NavButton name="info" color={color} onPress={this.handlePress} />;
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  recipients: getRecipientsInGroupNarrow(state, props.narrow),
}))(InfoNavButtonGroup);
