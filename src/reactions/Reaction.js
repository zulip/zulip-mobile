/* @flow */
import React, { PureComponent } from 'react';
import { Animated, StyleSheet, Text, View, Easing } from 'react-native';

import type { Auth, AnimatedValue, GlobalState } from '../types';
import connectWithActions from '../connectWithActions';
import { BRAND_COLOR, HALF_COLOR, REACTION_HEIGHT, REACTION_SPINNER_OFFSET } from '../styles';
import { Touchable } from '../common';
import Emoji from '../emoji/Emoji';
import RealmEmoji from '../emoji/RealmEmoji';
import emojiMap from '../emoji/emojiMap';
import { getAuth, getRealmEmoji } from '../selectors';
import { emojiReactionAdd, emojiReactionRemove } from '../api';

const styles = StyleSheet.create({
  touchable: {
    marginRight: 4,
    marginTop: 4,
    borderRadius: 4,
  },
  frameCommon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
    height: REACTION_HEIGHT,
  },
  frameVoted: {
    borderColor: BRAND_COLOR,
    backgroundColor: 'rgba(36, 202, 194, 0.1)',
  },
  frameNotVoted: {
    borderColor: HALF_COLOR,
  },
  placeholderCount: {
    marginLeft: 4,
    color: 'transparent',
  },
  countVoted: {
    color: BRAND_COLOR,
  },
  countNotVoted: {
    color: HALF_COLOR,
  },
  spinner: {
    position: 'absolute',
    top: -REACTION_SPINNER_OFFSET,
    right: 4,
  },
  spinnerTextContainer: {
    flex: 1,
    height: REACTION_SPINNER_OFFSET,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const incrementAnimationConfig = {
  toValue: 1,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99),
  useNativeDriver: true,
};

const decrementAnimationConfig = {
  toValue: 2,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99),
  useNativeDriver: true,
};

type Props = {
  code: string,
  name: string,
  voted: boolean,
  voteCount: number,
  messageId: number,
  auth: Auth,
  realmEmoji: Object,
  reactionType: string,
};

type State = {
  voteChangeAnimation: AnimatedValue,
};

class Reaction extends PureComponent<Props, State> {
  state = {
    voteChangeAnimation: new Animated.Value(0),
  };

  props: Props;

  componentWillReceiveProps = nextProps => {
    if (nextProps.voteCount > this.props.voteCount) {
      this.incrementSpinner();
    } else if (nextProps.voteCount < this.props.voteCount) {
      this.decrementSpinner();
    }
  };

  handlePress = () => {
    const { auth, code, messageId, name, reactionType, voted } = this.props;

    if (voted) {
      emojiReactionRemove(auth, messageId, reactionType, code, name);
    } else {
      emojiReactionAdd(auth, messageId, reactionType, code, name);
    }
  };

  incrementSpinner = () => {
    this.state.voteChangeAnimation.setValue(0);
    Animated.timing(this.state.voteChangeAnimation, incrementAnimationConfig).start();
  };

  decrementSpinner = () => {
    this.state.voteChangeAnimation.setValue(1);
    Animated.timing(this.state.voteChangeAnimation, decrementAnimationConfig).start();
  };

  dynamicSpinnerStyles = () => ({
    ...StyleSheet.flatten(styles.spinner),
    transform: [
      {
        translateY: this.state.voteChangeAnimation.interpolate({
          inputRange: [0, 0.5, 1, 1.5, 2],
          outputRange: [0, REACTION_SPINNER_OFFSET, 0, -REACTION_SPINNER_OFFSET, 0],
        }),
      },
    ],
  });

  render() {
    const { name, voted, voteCount, realmEmoji } = this.props;
    const frameStyle = voted ? styles.frameVoted : styles.frameNotVoted;
    const countStyle = voted ? styles.countVoted : styles.countNotVoted;

    return (
      <Touchable onPress={this.handlePress} style={styles.touchable}>
        <View style={[styles.frameCommon, frameStyle]}>
          {emojiMap[name] ? (
            <Emoji name={name} />
          ) : realmEmoji[name] ? (
            <RealmEmoji name={name} />
          ) : (
            <Emoji name="copyright" />
          )}

          <Animated.View style={this.dynamicSpinnerStyles()}>
            <View style={styles.spinnerTextContainer}>
              <Text style={countStyle}>{voteCount - 1}</Text>
            </View>
            <View style={styles.spinnerTextContainer}>
              <Text style={countStyle}>{voteCount}</Text>
            </View>
            <View style={styles.spinnerTextContainer}>
              <Text style={countStyle}>{voteCount + 1}</Text>
            </View>
          </Animated.View>

          <Text style={styles.placeholderCount}>{voteCount}</Text>
        </View>
      </Touchable>
    );
  }
}

export default connectWithActions((state: GlobalState) => ({
  auth: getAuth(state),
  realmEmoji: getRealmEmoji(state),
}))(Reaction);
