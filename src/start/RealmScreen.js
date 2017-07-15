/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, View, StyleSheet, Keyboard } from 'react-native';
import { connect } from 'react-redux';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { Label, Screen, ErrorMsg, ZulipButton, Input, Touchable } from '../common';
import { getAuthBackends } from '../api';
import config from '../config';
import { fixRealmUrl } from '../utils/url';
import { BRAND_COLOR } from '../styles';
import { IconQuestion } from '../common/Icons';

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
  container: {
    paddingBottom: 25,
  },
  helpButtonIcon: {
    color: BRAND_COLOR,
  },
  helpButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 22,
    paddingBottom: 60,
    position: 'absolute',
    right: 0,
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
    let { realm } = this.state;

    // Automatically prepend 'https://' if the user does not enter a protocol
    if (realm.search(/\b(http|https):\/\//) === -1) {
      realm = `https://${realm}`;
    }

    realm = realm.replace(/\/$/, '');

    this.setState({
      realm: fixRealmUrl(realm),
      progress: true,
      error: undefined,
    });

    const { actions } = this.props;

    try {
      const authBackends = await getAuthBackends({ realm });
      actions.realmAdd(realm);
      actions.navigateToAuth(authBackends);
      Keyboard.dismiss();
    } catch (err) {
      this.setState({ error: 'Can not connect to server' });
    } finally {
      this.setState({ progress: false });
    }
  };

  render() {
    const { styles } = this.context;
    const { progress, realm, error } = this.state;
    const HelpIcon = IconQuestion;

    return (
      <Screen title="Welcome" keyboardAvoiding>
        <ScrollView
          ref={scrollView => {
            this.scrollView = scrollView;
          }}
          centerContent
          keyboardShouldPersistTaps="always"
          onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}>
          <View style={[styles.container, componentStyles.container]}>
            <Label text="Your server URL" />
            <Input
              style={styles.field}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
              placeholder="Server URL"
              defaultValue={realm}
              onTextChange={value => this.setState({ realm: value })}
              blurOnSubmit={false}
              onSubmitEditing={this.tryRealm}
            />
            <View style={componentStyles.helpButtonContainer}>
              <Touchable>
                <HelpIcon name="question" size={22} style={componentStyles.helpButtonIcon} />
              </Touchable>
            </View>
            <ZulipButton text="Enter" progress={progress} onPress={this.tryRealm} />
            {error && <ErrorMsg error={error} />}
          </View>
        </ScrollView>
      </Screen>
    );
  }
}

export default connect(null, boundActions)(RealmScreen);
