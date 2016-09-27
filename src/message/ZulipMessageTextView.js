import React from 'react';
import {
  View,
  Text,
  Image,
  Linking,
  TouchableHighlight,
} from 'react-native';

import entities from 'entities';
import htmlparser from 'htmlparser2';

const styles = {
  container: {},
  base: {
    fontSize: 16,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: 'Menlo',
    fontSize: 14,
    padding: 4,
  },
  link: {
    fontWeight: 'bold',
    color: '#09f',
  },
  emoji: {
    width: 20,
    height: 20,
  },
  img: {
    width: 296,
    height: 150,
  },
  quote: {
  },
};

const tagStyles = {
  b: styles.bold,
  strong: styles.bold,
  i: styles.italic,
  em: styles.italic,
  pre: styles.code,
  a: styles.link,
  img: styles.img,
  blockquote: styles.quote,
};

const NEWLINE = '\n';
const BULLET = '\u2022 ';

const parseEmoji = (node, index) => undefined;
  // TODO: support emoji

const parseImg = (node, index, onPress) => {
  if (node.attribs.class === 'emoji') return parseEmoji(node, index);
  const source = {
    uri: node.attribs.src,
  };
  const img = (
    <Image
      key={index}
      source={source}
      style={styles.img}
      onPress={onPress}
      resizeMode={'cover'}
    />
  );
  if (onPress) {
    return (
      <TouchableHighlight key={index} onPress={onPress} style={styles.img}>
        {img}
      </TouchableHighlight>
    );
  }
  return img;
};

const parseLink = (node): string => {
  if (node.name === 'a' && node.attribs && node.attribs.href) {
    return node.attribs.href;
  }
  return '';
};

const parseDom = (dom, baseStyle, onPress) => {
  if (!dom) return null;

  return dom.map((node, index, list) => {
    if (node.name === 'img') {
      return parseImg(node, index, onPress);
    }

    switch (node.type) {
      case 'text':
        if (!node.data.trim()) return null;
        return (
          <Text key={index} style={baseStyle} onPress={onPress}>
            {entities.decodeHTML(node.data)}
          </Text>
        );
      case 'tag': {
        const link = parseLink(node);

        // Styling
        const style = [].concat(baseStyle);
        if (node.name in tagStyles) style.push(tagStyles[node.name]);

        return (
          <Text key={index} style={baseStyle}>
            {node.name === 'li' ? [BULLET] : null}
            {parseDom(
              node.children,
              style,
              link ? () => Linking.openURL(link) : null,
            )}
            {node.name === 'li' || node.name === 'br' ||
             (node.name === 'p' && index < list.length - 1) ? [NEWLINE] : null}
          </Text>
        );
      }
      default:
        return null;
    }
  });
};

const parseHtml = (html) =>
  new Promise((resolve, reject) => {
    const handler = new htmlparser.DomHandler((err, dom) => {
      if (err) reject(err);
      resolve(parseDom(dom, [styles.base]));
    });
    const parser = new htmlparser.Parser(handler);
    parser.write(html);
    parser.done();
  });

class ZulipMessageTextView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.initialize();
    this.state = {
      rendered: null,
    };
  }

  async initialize() {
    const rendered = await parseHtml(this.props.message);
    this.setState({ rendered });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.rendered}
      </View>
    );
  }
}

export default ZulipMessageTextView;
