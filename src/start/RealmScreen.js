import React from 'react';
import {
  TextInput,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import config from '../config';

import { markErrorsAsHandled } from '../error/errorActions';
import {
  addAccount,
} from '../account/accountActions';

import { styles, Screen, ErrorMsg, Button } from '../common';

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
    const { pendingServerResponse, onBack, errors } = this.props;

    return (
      <Screen title="Server" keybardAvoiding onBack={onBack}>
        <TextInput
          style={styles.input}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="Server address"
          value={this.state.realm}
          onChangeText={realm => this.setState({ realm })}
        />

        <Button
          text="Sign in"
          progress={pendingServerResponse}
          onPress={this.onRealmEnter}
        />

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
