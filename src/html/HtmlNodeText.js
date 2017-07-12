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
  <RawLabel style={cascadingTextStyle} text={entities.decodeHTML(data).replace(/\n/, '')} />;
