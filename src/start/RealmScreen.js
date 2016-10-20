import React from 'react';
import { TextInput } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { styles, Screen, ErrorMsg, Button } from '../common';
import { getAuthBackends } from '../api/apiClient';
import config from '../config';
import { realmAdd } from '../account/accountActions';
import AuthTypeScreen from './AuthTypeScreen';

type Props = {
  realm: ?string,
  navigateTo: (route: string) => void,
}

class RealmScreen extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);

    const realmFromConfig = process.env.NODE_ENV === 'development' ? config.devRealm : config.productionRealm;
    this.state = {
      progress: false,
      realm: props.realm || realmFromConfig,
      authBackends: [],
    };
  }

  tryRealm = async () => {
    const { realm } = this.state;

    this.setState({ progress: true, error: '' });

    try {
      const authBackends = await getAuthBackends({ realm });
      this.props.realmAdd(realm);
      if (authBackends.length === 1) {
        this.props.navigateTo(authBackends[0]);
      } else {
        this.setState({ progress: false, authBackends });
      }
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { authBackends, progress, error } = this.state;

    return (
      <Screen title="Add Server" keybardAvoiding>
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

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    realmAdd,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RealmScreen);
