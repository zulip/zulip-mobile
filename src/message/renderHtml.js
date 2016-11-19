import React from 'react';
import {
  Text,
  Image,
  Linking,
} from 'react-native';
import entities from 'entities';
import htmlparser from 'htmlparser2';

import { Touchable } from '../common';

const styles = {
  base: {
    fontSize: 16,
    lineHeight: 22,
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
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  link: {
    fontWeight: '600',
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
    paddingLeft: 5,
    marginLeft: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#ddd',
  },
  userMention: {
    fontWeight: 'normal',
    backgroundColor: '#eee',
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
  code: styles.code,
};

const BULLET = '\u2022 ';
const INLINETAGS = new Set(['li', 'span', 'strong', 'b', 'i', 'a', 'p']);

const parseImg = (node, index, context, onPress) => {
  const source = context.rewriteLink(node.attribs.src);
  const img = (
    <Image
      key={index}
      source={source}
      resizeMode={node.attribs.class === 'emoji' ? 'cover' : 'contain'}
      style={node.attribs.class === 'emoji' ? styles.emoji : styles.img}
    />
  );
  if (onPress) {
    return (
      <Touchable key={index} onPress={onPress} style={styles.img}>
        {img}
      </Touchable>
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

const parseDom = (dom, context, baseStyle, onPress) => {
  if (!dom) return null;

  return dom.map((node, index, list) => {
    if (node.name === 'img') {
      return parseImg(node, index, context, onPress);
    }

    switch (node.type) {
      case 'text':
        if (!node.data) return [];
        return (
          <Text key={index} style={baseStyle} onPress={onPress}>
            {entities.decodeHTML(node.data)}
          </Text>
        );
      case 'tag': {
        const link = context.rewriteLink(parseLink(node)).uri;

        // Styling
        const style = [].concat(baseStyle);
        if (node.name in tagStyles) style.push(tagStyles[node.name]);
        if (node.attribs.class === 'user-mention') {
          style.push(styles.userMention);
        }

        const children = parseDom(
          node.children,
          context,
          style,
          link ? () => Linking.openURL(link) : null,
        );

        if (!INLINETAGS.has(node.name)) {
          return children;
        }

        return (
          <Text key={index} style={baseStyle}>
            {node.name === 'li' ? [BULLET] : null}
            {children}
            {/* {node.name === 'li' || node.name === 'br' ||
              (node.name === 'p' && index < list.length - 1) ? ['\n'] : null} */}
          </Text>
        );
      }
      default:
        return null;
    }
  });
};

export type Context = {
  rewriteLink: (uri: string) => Object,
};

const defaultContext = {
  rewriteLink: (uri) => ({ uri }),
};

export const renderHtml = (html: string, context: Context = defaultContext) =>
  new Promise((resolve, reject) => {
    const handler = new htmlparser.DomHandler((err, dom) => {
      if (err) reject(err);
      resolve(parseDom(dom, context, [styles.base]));
    });
    const parser = new htmlparser.Parser(handler);
    parser.write(html.replace(/\n|\r/g, ''));
    parser.done();
  });
