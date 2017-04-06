import React from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { connect } from 'react-redux';

import { BRAND_COLOR } from '../common/styles';
import { Touchable } from '../common';
import Emoji from '../emoji/Emoji';
import { getAuth } from '../account/accountSelectors';
import { emojiReactionAdd, emojiReactionRemove } from '../api';

const styles = StyleSheet.create({
  touchable: {
    marginRight: 4,
    borderRadius: 4
  },
  frameCommon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden'
  },
  frameVoted: {
    borderColor: BRAND_COLOR,
    backgroundColor: 'rgba(36, 202, 194, 0.05)',
  },
  frameNotVoted: {
    borderColor: '#dedede', // eslint-disable-line
  },
  placeHolderCount: {
    marginLeft: 4,
    color: 'transparent'
  },
  countVoted: {
    color: BRAND_COLOR,
  },
  countNotVoted: {
    color: 'gray',
  },
  roller: {
    position: 'absolute',
    top: -20,
    right: 4,
  },
  rollerText: {
    paddingTop: 3,
    paddingBottom: 3
  }
});

const forwardAnimationConfig = {
  fromValue: 0,
  toValue: 1,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99)
};

const backAnimationConfig = {
  ...forwardAnimationConfig,
  fromValue: 1,
  toValue: 2
};

class Reaction extends React.PureComponent {

  state = {
    voteChangeAnimation: new Animated.Value(0)
  };

  props: {
    name: string,
    voted: boolean,
  };

  componentWillReceiveProps = (nextProps) => {
    const { voteCount } = this.props;

    if( nextProps.voteCount > voteCount ) {
      this.animation(Animated.timing, 'voteChangeAnimation', forwardAnimationConfig).start();
    } else {
      this.animation(Animated.timing, 'voteChangeAnimation', backAnimationConfig).start();
    }
  }

  animation = (fn, stateVar, config, reverse) => {
    if (reverse)
      [config.fromValue, config.toValue] = [config.toValue, config.fromValue];
    this.state[stateVar].setValue(config.fromValue);
    return fn(this.state[stateVar], config);
  }

  handlePress = () => {
    const { auth, messageId, name, voted } = this.props;

    if (voted) {
      emojiReactionRemove(auth, messageId, name);
    } else {
      emojiReactionAdd(auth, messageId, name);
    }
  };

  dynamicRollerStyles = () => ({
    ...StyleSheet.flatten(styles.roller),
    transform: [
      {
        translateY: this.state.voteChangeAnimation.interpolate({
          inputRange: [0, 0.5, 1, 1.5, 2],
          outputRange: [0, 20, 0, -20, 0]
        })
      }
    ]
  })

  render() {
    const { name, voted, voteCount } = this.props;
    const frameStyle = voted ? styles.frameVoted : styles.frameNotVoted;
    const countStyle = voted ? styles.countVoted : styles.countNotVoted;

    return (
      <Touchable onPress={this.handlePress} style={styles.touchable}>
        <Animated.View style={[styles.frameCommon, frameStyle]}>
          <Emoji name={name} />

          <Animated.View style={this.dynamicRollerStyles()}>
            <Text style={[styles.rollerText, countStyle]}>{ voteCount -  1 }</Text>
            <Text style={[styles.rollerText, countStyle]}>{ voteCount }</Text>
            <Text style={[styles.rollerText, countStyle]}>{ voteCount + 1 }</Text>
          </Animated.View>

          <Text style={styles.placeHolderCount}>
            {voteCount}
          </Text>
        </Animated.View>
      </Touchable>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
});

export default connect(mapStateToProps)(Reaction);
