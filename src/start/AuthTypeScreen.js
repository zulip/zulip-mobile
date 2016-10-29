import React from 'react';
import { View } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Button } from '../common';
import { setAuthType } from '../account/accountActions';

class AuthTypeScreen extends React.Component {

  props: {
    authBackends: string[],
  };

  handleTypeSelect = (authType: string) => {
    this.props.setAuthType(authType);
  }

  render() {
    const { authBackends } = this.props;

    return (
      <View>
        {authBackends.includes('dev')
          && <Button text="Dev Login" onPress={() => this.handleTypeSelect('dev')} />}
        {authBackends.includes('password')
          && <Button text="Login with Email" onPress={() => this.handleTypeSelect('password')} />}
        {authBackends.includes('google')
          && <Button text="Login with Google" onPress={() => this.handleTypeSelect('google')} />}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    setAuthType,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AuthTypeScreen);
