import React from 'react';
import {
  View,
  Text,
  TouchableHighlight,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ZulipError from './ZulipError';
import styles from './styles';

// Actions
import { markErrorsAsHandled } from '../error/errorActions';
import {
  LOGIN_FAILED,
  attemptDevLogin,
  getDevEmails,
} from './userActions';

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
          admin
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

    return (
      <View style={styles.container}>
        <ZulipError errors={this.props.errors} />
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
