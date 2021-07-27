/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import SectionSeparator from './SectionSeparator';

/*
 * Upstream `SectionList` is full of `any`s.  This type is incomplete,
 * and just captures what we use.
 */
type Props = $ReadOnly<{|
  leadingItem: ?{ ... },
  leadingSection: ?{ data: { length: number, ... }, ... },
|}>;

/** Can be passed to RN's `SectionList` as `SectionSeparatorComponent`. */
export default class SectionSeparatorBetween extends PureComponent<Props> {
  render(): Node {
    const { leadingItem, leadingSection } = this.props;

    if (leadingItem || !leadingSection || leadingSection.data.length === 0) {
      return null;
    }

    return <SectionSeparator />;
  }
}
