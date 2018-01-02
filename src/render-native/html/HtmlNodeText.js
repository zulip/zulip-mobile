/* @flow */
import React from 'react';
import entities from 'entities';

import type { StyleObj } from '../../types';
import { RawLabel } from '../../common';

type Props = {
  data: string,
  cascadingTextStyle?: StyleObj,
  splitMessageText?: boolean,
};

export default ({ data, cascadingTextStyle, splitMessageText }: Props) => {
  if (splitMessageText) {
    const textItems = entities
      .decodeHTML(data)
      .replace(/\n/, '')
      .split(' ');
    const itemsCount = textItems.length;
    return textItems.map((text, index) => (
      <RawLabel
        key={Math.random()
          .toString(36)
          .substring(7)}
        style={cascadingTextStyle}
        text={itemsCount === index + 1 ? text : `${text} `}
      />
    ));
  }
  return <RawLabel style={cascadingTextStyle} text={entities.decodeHTML(data).replace(/\n/, '')} />;
};
