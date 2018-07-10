/* @flow */
import { PureComponent } from 'react';

import type { ChildrenArray } from '../types';
import timing from '../utils/timing';

type Props = {
  children: ChildrenArray<*>,
  name: string,
};

export default class RenderTimer extends PureComponent<Props> {
  componentDidMount() {
    timing.start(this.props.name);
  }

  componentWillUnmount() {
    timing.end(this.props.name);
  }

  render() {
    return this.props.children;
  }
}
