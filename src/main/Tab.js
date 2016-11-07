import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { BRAND_COLOR } from '../common/styles';

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLOR,
  },
  activityCircle: {
    position: 'absolute',
    top: 12,
    left: 56,
    backgroundColor: 'white',
    borderRadius: 4,
    width: 8,
    height: 8,
  },
});

export default class Tab extends React.Component {

  props: {
    activity: boolean,
    index: number;
  }

  handlePress = () =>
    this.props.onPress(this.props.index);

  render() {
    const { activity, icon } = this.props;

    return (
      <TouchableOpacity
        style={styles.tab}
        onPress={this.handlePress}
      >
        <Icon
          name={icon}
          size={22}
          color="white"
        />
        {activity && <View style={styles.activityCircle} />}
      </TouchableOpacity>
    );
  }
}
