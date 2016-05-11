import React, {
  Component,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  ActivityIndicatorIOS,
} from 'react-native';

const STATUS_BAR_HEIGHT = 20;
const FIELD_HEIGHT = 44;
const LABEL_WIDTH = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: STATUS_BAR_HEIGHT,
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
  fieldLabel: {
    textAlign: 'left',
    marginRight: 10,
    fontWeight: 'normal',
    width: LABEL_WIDTH,
  },
  fieldInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
  },
  fieldButton: {
    flex: 1,
    backgroundColor: '#ced',
    alignItems: 'center',
    padding: 10,
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: '#999',
  },
});

const ZulipLoginButton = (props) => (
  props.spinning ?
    <ActivityIndicatorIOS />
    :
    <TouchableHighlight
      style={styles.fieldButton}
      onPress={props.onPress}
    >
      <Text>Sign in</Text>
    </TouchableHighlight>
);

ZulipLoginButton.propTypes = {
  spinning: React.PropTypes.bool.isRequired,
  onPress: React.PropTypes.func.isRequired,
};

export default class ZulipLoginView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realm: 'http://localhost:9991',
      email: 'test@test.com',
      password: 'password',
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Realm</Text>
          <TextInput
            ref="realmInput"
            style={styles.fieldInput}
            autoCapitalize={"none"}
            placeholder="www.zulip.com"
            value={this.state.realm}
            onChangeText={realm => this.setState({ realm })}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            ref="emailInput"
            style={styles.fieldInput}
            autoCapitalize={"none"}
            placeholder="you@something.com"
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            ref="passwordInput"
            style={styles.fieldInput}
            autoCapitalize={"none"}
            placeholder="pa55w0rd"
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
          />
        </View>
        <View style={styles.field}>
          <ZulipLoginButton
            enabled={!this.props.pendingLogin}
            spinning={this.props.pendingLogin}
            onPress={() => this.props.attemptLogin(
              this.state.realm,
              this.state.email,
              this.state.password,
            )}
          />
        </View>
      </View>
    );
  }
}

ZulipLoginView.propTypes = {
  pendingLogin: React.PropTypes.bool.isRequired,
  attemptLogin: React.PropTypes.func.isRequired,
};
