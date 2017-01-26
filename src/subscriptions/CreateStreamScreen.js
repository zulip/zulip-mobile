import React from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Screen, Button } from '../common';
import { getAuth } from '../account/accountSelectors';


class CreateStreamScreen extends React.Component {
  render() {
    return (
      <Screen title="Create Stream">
        <Text>name</Text>
        <Text>description</Text>
        <Text>color</Text>
        <Button text="Create" />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
  }),
  boundActions,
)(CreateStreamScreen);
