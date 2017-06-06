/* @flow */
import React from 'react';
import entities from 'entities';
import { RawLabel } from '../common';

type FuncArguments = {
  data: string,
}

export default ({ data }: FuncArguments) => (
  <RawLabel
    text={entities.decodeHTML(data).replace(/\n$/, '')}
  />
);
