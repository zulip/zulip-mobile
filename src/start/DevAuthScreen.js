import React from 'react';
import {
  ScrollView,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Screen, ErrorMsg, Button } from '../common';
import { getAuth } from '../accountlist/accountlistSelectors';
import { markErrorsAsHandled } from '../error/errorActions';
import {
  LOGIN_FAILED,
  attemptDevLogin,
  getDevEmails,
} from '../account/accountActions';

class DevAuthScreen extends React.Component {

  componentWillMount() {
    // Fetch list of dev accounts when component is mounted
    //
    // We use setTimeout with time=0 to force this to happen in the next
    // iteration of the event loop. This ensures that the last action ends
    // before the new action begins and makes the debug output clearer.
    setTimeout(() => this.props.getDevEmails(this.props.auth), 0);
  }

  loginPressed = (user) => {
    this.props.markErrorsAsHandled(this.props.errors);
    this.props.attemptDevLogin(
      this.props.account,
      user,
    );
  };

  render() {
    const { directAdmins, directUsers, activeBackend } = this.props.account;
    const error = 'TODO';

    return (
      <Screen title="Dev Account Login">
        <ScrollView>
          {activeBackend &&
            directAdmins.map((user) =>
              <Button
                key={user}
                text={user}
                onPress={() => this.loginPressed(user)}
              />
            )
          }
          {directUsers.map((user) =>
            <Button
              key={user}
              text={user}
              secondary
              onPress={() => this.loginPressed(user)}
            />
          )}
        </ScrollView>
        <ErrorMsg error={error} />
      </Screen>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
  account: state.user.accounts.get(state.user.activeAccountId),
  errors: state.errors.filter(e => e.active && e.type === LOGIN_FAILED),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    getDevEmails,
    attemptDevLogin,
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(DevAuthScreen);
