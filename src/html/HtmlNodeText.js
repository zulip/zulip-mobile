/* @flow */
import React from 'react';
import entities from 'entities';
import { RawLabel } from '../common';

type Props = {
  data: string,
};

export default ({ data }: Props) => (
  <RawLabel
    text={entities.decodeHTML(data).replace(/\n$/, '')}
  />
);
