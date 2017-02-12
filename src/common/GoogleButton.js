import React from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  ActivityIndicator,
} from 'react-native';
import Touchable from './Touchable';

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  logo: {
    width: 44,
    height: 44,
  },
  touchTarget: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'black',
    fontSize: 16,
  },
});

const ButtonInProgress = () => (
  <View style={styles.frame}>
    <ActivityIndicator color="white" />
  </View>
);

const ButtonNormal = ({ text, onPress }) => (
  <View style={styles.frame}>
    <Touchable
      style={styles.touchTarget}
      onPress={onPress}
    >
      <View style={styles.touchTarget}>
        <Image
          style={styles.logo}
          resizeMode="contain"
          source={require('../../static/img/google_auth_logo.png')}
        />
        <Text style={styles.text}>
          {text}
        </Text>
        <View style={styles.logo} />
      </View>
    </Touchable>
  </View>
);

export default class GoogleButton extends React.PureComponent {

  props: {
    progress: boolean,
    text: string,
    onPress: () => void,
  }

  render() {
    const { progress, onPress } = this.props;

    if (progress) {
      return <ButtonInProgress />;
    }

    return (
      <ButtonNormal
        text="Sign in with Google"
        onPress={onPress}
      />
    );
  }
}
