/* @flow */
import React from 'react';
import entities from 'entities';

import type { StyleObj } from '../types';
import { RawLabel } from '../common';

type Props = {
  data: string,
  cascadingTextStyle?: StyleObj,
};

export default ({ data, cascadingTextStyle }: Props) =>
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
    ));
