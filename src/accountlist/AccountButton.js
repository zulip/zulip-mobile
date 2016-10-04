import React from 'react';

import Button from '../common/Button';

export default class AccountButton extends React.PureComponent {

  props: {
    email: string,
    realm: string,
    progress: boolean,
    onPress: () => void,
  };

  render() {
    const { email, realm, progress, onPress } = this.props;

    return (
      <Button
        secondary
        text={`${email}\n${realm}`}
        progress={progress}
        onPress={onPress}
      />
    );
  }
}
