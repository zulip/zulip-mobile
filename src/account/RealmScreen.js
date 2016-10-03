import React from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import config from '../config';

// Actions
import { markErrorsAsHandled } from '../error/errorActions';
import {
  addAccount,
} from './userActions';

import styles from '../common/styles';
import ErrorMsg from '../common/ErrorMsg';
import Button from '../common/Button';

class ZulipRealmView extends React.Component {
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
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.field}>
          <Text style={styles.heading1}>Welcome to Zulip</Text>
        </View>

        <View style={styles.smallField}>
          <Text style={styles.label}>Server address</Text>
        </View>

        <View style={styles.field}>
          <TextInput
            style={styles.input}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="www.zulip.com"
            value={this.state.realm}
            onChangeText={realm => this.setState({ realm })}
          />
        </View>

        <View style={styles.field}>
          <Button
            text="Next"
            progress={pendingServerResponse}
            onPress={this.onRealmEnter}
          />
        </View>

        <ErrorMsg errors={errors} />
      </KeyboardAvoidingView>
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

export default connect(mapStateToProps, mapDispatchToProps)(ZulipRealmView);
