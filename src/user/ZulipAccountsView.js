import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
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
import ZulipButton from './ZulipButton';

const STATUS_BAR_HEIGHT = 20;
const FIELD_HEIGHT = 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: STATUS_BAR_HEIGHT,
  },
  error: {
    justifyContent: 'flex-start',
    textAlign: 'center',
    fontSize: 24,
    padding: 10,
  },
  heading1: {
    textAlign: 'center',
    fontSize: 24,
    padding: 10,
  },
  heading2: {
    textAlign: 'center',
    fontSize: 18,
    padding: 10,
  },
  user: {
    backgroundColor: '#8ac',
  },
  admin: {
    backgroundColor: '#f88',
  },
  fieldInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: FIELD_HEIGHT,
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },
});


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

  render() {
    if (this.props.activeAccountId) {
      const activeAccount = this.props.accounts.get(this.props.activeAccountId);
      if (activeAccount.authBackends.includes('dev')) {
        return <ZulipDevAuthView />;
      } else {
        return <ZulipPasswordAuthView />;
      }
    }

    const errors = this.props.errors.map((err) =>
      <Text key={err.timestamp} style={styles.error}>
        {err.message}
      </Text>
    );

    return (
      <View style={styles.container}>
        {errors}

        <Text style={styles.heading1}>
          Add an account
        </Text>

        <Text style={styles.heading2}>
          Realm:
        </Text>

        <View style={styles.field}>
          <TextInput
            ref="realmInput"
            style={styles.fieldInput}
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
            onPress={() => {
              this.props.markErrorsAsHandled(this.props.errors);
              this.props.addAccount(this.state.realm);
            }}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.user.accounts,
  activeAccountId: state.user.activeAccountId,
  errors: state.errors.filter(e => e.active),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    addAccount,
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipAccountsView);
