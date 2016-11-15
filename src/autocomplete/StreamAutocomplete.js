import React, { Component } from 'react';

import { Popup } from '../common';
import Emoji from '../emoji/Emoji';

type Props = {
  ownEmail: string,
  users: any[],
  presence: Object,
};

export default class StreamAutocomplete extends Component {

  props: Props;

  handleSelect = (index: number) => {
  }

  render() {
    return (
      <Popup>
        <Emoji />
      </Popup>
    );
  }
}
