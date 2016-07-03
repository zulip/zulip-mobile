import React, {
  Component,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  ActivityIndicatorIOS,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import {
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

const ZulipUserLoginButton = (props) => {
  return (
    <View style={styles.field}>
      <TouchableHighlight
        style={[styles.userButton, props.admin? styles.admin : styles.user]}
        onPress={props.attemptLogin}
      >
        <Text>{props.email}</Text>
      </TouchableHighlight>
    </View>
  );
};

class ZulipDevAuthView extends Component {
  componentWillMount() {
    // Fetch list of dev accounts when component is mounted
    // 
    // We use setTimeout with time=0 to force this to happen in the next
    // iteration of the event loop. This ensures that the last action ends
    // before the new action begins and makes the debug output clearer.
    setTimeout(() => this.props.getDevEmails(this.props.account), 0);
  }

  render() {
    if (this.props.account.activeBackend) {
      // Render list of realm admins
      var directAdmins = this.props.account.directAdmins.map((user) => {
        return <ZulipUserLoginButton
                 key={user}
                 email={user}
                 admin={true}
                 attemptLogin={() => this.props.attemptDevLogin(
                  this.props.account,
                  user,
                 )}
               />
      });
      // Render list of realm users
      var directUsers = this.props.account.directUsers.map((user) => {
        return <ZulipUserLoginButton
                 key={user}
                 email={user}
                 admin={false}
                 attemptLogin={() => this.props.attemptDevLogin(
                  this.props.account,
                  user,
                 )}
                />
      });
    }
    return (
      <View style={styles.container}>
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
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    getDevEmails,
    attemptDevLogin,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipDevAuthView);
