/* @flow strict-local */
import React from 'react';
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
export default function SectionSeparatorBetween(props: Props): Node {
  const { leadingItem, leadingSection } = props;

  if (leadingItem || !leadingSection || leadingSection.data.length === 0) {
    return null;
  }

  return <SectionSeparator />;
}
