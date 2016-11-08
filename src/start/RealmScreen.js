import React from 'react';
import { TextInput } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { getAuth } from '../accountlist/accountlistSelectors';
import { styles, Screen, ErrorMsg, Button } from '../common';
import { getAuthBackends } from '../api/apiClient';
import config from '../config';
import { realmAdd, setAuthType } from '../account/accountActions';
import AuthTypeScreen from './AuthTypeScreen';

type Props = {
  realm: ?string,
  navigateTo: (route: string) => void,
}

class RealmScreen extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);

    const realmFromConfig = process.env.NODE_ENV === 'development'
      ? config.devRealm
      : config.productionRealm;
    this.state = {
      progress: false,
      realm: props.realm || realmFromConfig,
      authBackends: [],
    };
  }

  tryRealm = async () => {
    let { realm } = this.state;
    if (realm.search(/\b(http|https):\/\//) === -1) {
      realm = `https://${realm}`;
    }

    this.setState({ progress: true, error: undefined });

    try {
      const authBackends = await getAuthBackends({ realm });
      this.props.realmAdd(realm);
      if (authBackends.length === 1) {
        this.props.setAuthType(authBackends[0]);
        this.props.navigateTo(authBackends[0]);
      } else {
        this.setState({ progress: false, authBackends });
      }
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { authBackends, progress, realm, error } = this.state;

    return (
      <Screen title="Add Server" keyboardAvoiding>
        <TextInput
          style={styles.input}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="Server address"
          defaultValue={realm}
          onChangeText={value => this.setState({ realm: value })}
        />
        <Button
          text="Sign in"
          progress={progress}
          onPress={this.tryRealm}
        />
        <ErrorMsg error={error} />
        {authBackends.length > 0 &&
          <AuthTypeScreen authBackends={authBackends} />}
      </Screen>
    );
  }
}

const mapStateToProps = (state) => ({
  realm: getAuth(state).get('realm'),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    realmAdd,
    setAuthType,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RealmScreen);
