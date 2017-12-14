/* @flow */
import React, { PureComponent } from 'react';
import SectionSeparator from './SectionSeparator';

type Props = {
  leadingItem: Object,
  leadingSection: Object,
  trailingItem: Object,
  trailingSection: Object,
};

export default class SectionSeparatorBetween extends PureComponent<Props> {
  props: Props;

  render() {
    const { leadingItem, leadingSection } = this.props;

    if (!leadingSection || leadingItem) return null;

    return <SectionSeparator />;
  }
}
