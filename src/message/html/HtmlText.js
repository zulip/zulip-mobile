import React from 'react';
import entities from 'entities';
import { Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 22,
  }
});

export default class HtmlText extends React.PureComponent {
  render() {
    const { data, style } = this.props;

    return (
      <Text style={[styles.text, style]}>
        {entities.decodeHTML(data)}
      </Text>
    );
  }
}
