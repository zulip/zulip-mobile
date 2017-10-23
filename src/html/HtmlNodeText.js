/* @flow */
import React from 'react';
import entities from 'entities';

import type { StyleObj } from '../types';
import { RawLabel } from '../common';

type Props = {
  data: string,
  cascadingTextStyle?: StyleObj,
  splitMessageText?: boolean,
};

export default ({ data, cascadingTextStyle, splitMessageText }: Props) =>
  splitMessageText ? (
    entities
      .decodeHTML(data)
      .replace(/\n/, '')
      .split(' ')
      .map(text => (
        <RawLabel
          key={Math.random()
            .toString(36)
            .substring(7)}
          style={cascadingTextStyle}
          text={`${text} `}
        />
      ))
  ) : (
    <RawLabel style={cascadingTextStyle} text={entities.decodeHTML(data).replace(/\n/, '')} />
  );
