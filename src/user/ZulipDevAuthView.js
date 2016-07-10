import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import { markErrorsAsHandled } from '../error/errorActions';
import {
  LOGIN_FAILED,
  attemptDevLogin,
  getDevEmails,
} from './userActions';

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
  field: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: FIELD_HEIGHT,
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  user: {
    backgroundColor: '#8ac',
  },
  admin: {
    backgroundColor: '#f88',
  },
  userButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
  },
});

const ZulipUserLoginButton = (props) =>
  <View style={styles.field}>
    <TouchableHighlight
      style={[styles.userButton, props.admin ? styles.admin : styles.user]}
      onPress={props.attemptLogin}
    >
      <Text>{props.email}</Text>
    </TouchableHighlight>
  </View>;

class ZulipDevAuthView extends React.Component {
  componentWillMount() {
    // Fetch list of dev accounts when component is mounted
    //
    // We use setTimeout with time=0 to force this to happen in the next
    // iteration of the event loop. This ensures that the last action ends
    // before the new action begins and makes the debug output clearer.
    setTimeout(() => this.props.getDevEmails(this.props.account), 0);
  }

  render() {
    let directAdmins = [];
    let directUsers = [];
    if (this.props.account.activeBackend) {
      // Render list of realm admins
      directAdmins = this.props.account.directAdmins.map((user) =>
        <ZulipUserLoginButton
          key={user}
          email={user}
          admin={true}
          attemptLogin={() => this.props.attemptDevLogin(
            this.props.account,
            user,
          )}
        />
      );
      // Render list of realm users
      directUsers = this.props.account.directUsers.map((user) =>
        <ZulipUserLoginButton
          key={user}
          email={user}
          admin={false}
          attemptLogin={() => {
            this.props.markErrorsAsHandled(this.props.errors);
            this.props.attemptDevLogin(
              this.props.account,
              user,
            );
          }}
        />
      );
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
          Zulip Dev Login
        </Text>
        <Text style={styles.heading2}>
          Choose a user:
        </Text>
        {directAdmins}
        {directUsers}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  account: state.user.accounts.get(state.user.activeAccountId),
  errors: state.errors.filter(e => e.active && e.type === LOGIN_FAILED),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    getDevEmails,
    attemptDevLogin,
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipDevAuthView);
