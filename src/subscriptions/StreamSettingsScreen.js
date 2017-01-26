import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Screen, Button } from '../common';
import { getAuth } from '../account/accountSelectors';


class StreamSettingsScreen extends React.Component {
  render() {
    return (
      <Screen title="Create Stream">
        name
        description
        members
        add member
        <Button text="Update" />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
  }),
  boundActions,
)(StreamSettingsScreen);
