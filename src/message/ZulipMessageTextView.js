import React from 'react';
import {
  Text,
  Image,
  Linking,
} from 'react-native';

import HTMLView from 'react-native-htmlview';

const styles = {
  img: {
    width: 20,
    height: 20,
  },
  pre: {
    backgroundColor: '#eee',
    fontFamily: 'Menlo',
  }
}

const renderNode = (node, index, list) => {
  if (node.type === 'tag') {
    if (node.name === 'img') {
      const source = {
        uri: node.attribs.src,
      }
      return <Image key={index} source={source} style={styles.img} />
    }
  }
};

class ZulipMessageTextView extends React.Component {
  render() {
    return (
      <HTMLView
        value={this.props.message}
        stylesheet={styles}
        renderNode={renderNode}
        // NOTE: we need to add .bind(Linking) due to a bug
        // in the react-native-htmlview library
        onLinkPress={Linking.openURL.bind(Linking)}
      />
    );
  }
}

export default ZulipMessageTextView;
