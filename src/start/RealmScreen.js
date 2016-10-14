import React from 'react';
import {
  View,
  TextInput,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import config from '../config';

import { markErrorsAsHandled } from '../error/errorActions';
import {
  addAccount,
} from '../account/accountActions';

import styles from '../common/styles';
import Screen from '../common/Screen';
import ErrorMsg from '../common/ErrorMsg';
import Button from '../common/Button';

class RealmScreen extends React.Component {
  constructor(props) {
    super(props);

    const realmFromConfig = process.env.NODE_ENV === 'development' ? config.devRealm : config.productionRealm;
    this.state = {
      realm: props.realm || realmFromConfig,
    };
  }

  onRealmEnter = () => {
    this.props.markErrorsAsHandled(this.props.errors);
    this.props.addAccount(this.state.realm);
  }

  render() {
    const { pendingServerResponse, errors } = this.props;

    return (
      <Screen keybardAvoiding>
        <TextInput
          style={styles.input}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="Server address"
          value={this.state.realm}
          onChangeText={realm => this.setState({ realm })}
        />

        <View style={styles.field}>
          <Button
            text="Sign in"
            progress={pendingServerResponse}
            onPress={this.onRealmEnter}
          />
        </View>

        <ErrorMsg errors={errors} />
      </Screen>
    );
  }
}

const mapStateToProps = (state) => ({
  pendingServerResponse: state.app.get('pendingServerResponse'),
  errors: state.errors.filter(e => e.active),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    addAccount,
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RealmScreen);
