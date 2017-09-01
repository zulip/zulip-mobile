/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, View, StyleSheet, Keyboard } from 'react-native';
import { connect } from 'react-redux';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { Label, Screen, ErrorMsg, ZulipButton, Input } from '../common';
import { getAuthBackends } from '../api';
import config from '../config';
import { fixRealmUrl } from '../utils/url';

type Props = {
  actions: Actions,
  realm: string,
};

type State = {
  realm: string,
  error: ?string,
  progress: boolean,
};

const componentStyles = StyleSheet.create({
  spacer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: -16,
    marginRight: -16,
    marginBottom: -16,
  },
});

class RealmScreen extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;
  state: State;
  scrollView: ScrollView;

  constructor(props: Props) {
    super(props);

    const realmFromConfig =
      process.env.NODE_ENV === 'development' ? config.devRealm : config.productionRealm;
    this.state = {
      progress: false,
      realm: props.realm || realmFromConfig,
      error: undefined,
    };
  }

  tryRealm = async () => {
    const { realm } = this.state;
    const fixRealm = fixRealmUrl(realm);
    this.setState({
      realm: fixRealm,
      progress: true,
      error: undefined,
    });

    const { actions } = this.props;

    try {
      const authBackends = await getAuthBackends({ realm: fixRealm });
      actions.realmAdd(fixRealm);
      actions.navigateToAuth(authBackends);
      Keyboard.dismiss();
    } catch (err) {
      this.setState({ error: err.message });
    } finally {
      this.setState({ progress: false });
    }
  };

  render() {
    const { styles } = this.context;
    const { progress, realm, error } = this.state;

    return (
      <Screen title="Welcome" keyboardAvoiding>
        <ScrollView
          contentContainerStyle={styles.container}
          centerContent
          keyboardShouldPersistTaps="always"
        >
          <Label text="Your server URL" />
          <Input
            style={styles.field}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Server URL"
            defaultValue={realm}
            onChangeText={value => this.setState({ realm: value })}
            blurOnSubmit={false}
            keyboardType="url"
            onSubmitEditing={this.tryRealm}
          />
          {error && <ErrorMsg error={error} />}
          <View style={componentStyles.spacer}>
            <ZulipButton text="Enter" fullSize progress={progress} onPress={this.tryRealm} />
          </View>
        </ScrollView>
      </Screen>
    );
  }
}

export default connect(null, boundActions)(RealmScreen);
