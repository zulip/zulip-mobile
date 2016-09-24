import React from 'react';
import {
  Image,
  Linking,
} from 'react-native';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import HTMLView from 'react-native-htmlview';

const styles = {
  img: {
    width: 20,
    height: 20,
  },
  pre: {
    backgroundColor: '#eee',
    fontFamily: 'Menlo',
  },
};

const renderNode = (node, index, list) => {
  if (node.type === 'tag') {
    if (node.name === 'img') {
      const source = {
        uri: node.attribs.src,
      };
      return (
        <Image key={index} source={source} style={styles.img} />
      );
    }
  }
  return null;
};

class ZulipMessageTextView extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    return (
      <HTMLView
        value={this.props.message}
        stylesheet={styles}
        renderNode={renderNode}
        // NOTE: is .bind(Linking) still needed because of react-native-htmlview
        // it creates a new function on each component render
        onLinkPress={Linking.openURL}
      />
    );
  }
}

export default ZulipMessageTextView;
