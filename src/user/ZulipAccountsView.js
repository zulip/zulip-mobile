import React from 'react';
import {
  Image,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import { markErrorsAsHandled } from '../error/errorActions';
import {
  addAccount,
} from './userActions';

import ZulipPasswordAuthView from './ZulipPasswordAuthView';
import ZulipDevAuthView from './ZulipDevAuthView';
import styles from './styles';
import ZulipError from './ZulipError';
import ZulipButton from './ZulipButton';

class ZulipAccountsView extends React.Component {
  constructor(props) {
    super(props);

    let defaultRealm = '';
    if (process.env.NODE_ENV === 'development') {
      defaultRealm = 'http://localhost:9991';
    }
    this.state = {
      realm: defaultRealm,
    };
  }

  onRealmEnter = () => {
    this.props.markErrorsAsHandled(this.props.errors);
    this.props.addAccount(this.state.realm);
  }

  render() {
    if (this.props.activeAccountId) {
      const activeAccount = this.props.accounts.get(this.props.activeAccountId);
      if (activeAccount.authBackends.includes('dev')) {
        return <ZulipDevAuthView />;
      } else {
        return <ZulipPasswordAuthView />;
      }
    }

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Image
          style={styles.logo}
          source={require('../../static/img/zulip-logo.png')} resizeMode="contain"
        />

        <View style={styles.field}>
            <Text style={styles.heading1}>Welcome to Zulip</Text>
        </View>

        <View style={styles.smallField}>
            <Text style={styles.label}>Server address</Text>
        </View>

        <View style={styles.field}>
          <TextInput
            ref="realmInput"
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
          <ZulipButton
            text="Next"
            progress={this.props.pendingServerResponse}
            onPress={this.onRealmEnter}
          />
        </View>

        <ZulipError errors={this.props.errors} />
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.user.accounts,
  activeAccountId: state.user.activeAccountId,
  pendingServerResponse: state.user.pendingServerResponse,
  errors: state.errors.filter(e => e.active),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    addAccount,
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipAccountsView);
