/* @flow */
import React, { PureComponent } from 'react';
import SectionSeparator from './SectionSeparator';

type Props = {
  leadingItem: Object,
  leadingSection: Object,
};

export default class SectionSeparatorBetween extends PureComponent<Props> {
  render() {
    const { leadingItem, leadingSection } = this.props;

    if (leadingItem || !leadingSection || leadingSection.data.length === 0) {
      return null;
    }

    return <SectionSeparator />;
  }
}
