import React from 'react';
import { Switch } from 'react-native';
import { BRAND_COLOR } from './styles';

export default class ZulipSwitch extends React.PureComponent {

  props: {
    value: boolean,
    onValueChange: () => void,
  }

  constructor(props) {
    super(props);

    this.state = {
      valueControlled: props.defaultValue,
    };
  }

  handleValueChange = (newValue) => {
    const { onValueChange } = this.props;

    if (onValueChange) {
      onValueChange(newValue);
    }

    this.setState({
      valueControlled: newValue,
    });
  }

  render() {
    const { value } = this.props;
    const { valueControlled } = this.state;
    const switchValue = typeof valueControlled !== 'undefined' ? valueControlled : value;

    return (
      <Switch
        value={switchValue}
        onTintColor={BRAND_COLOR}
        tintColor={BRAND_COLOR}
        onValueChange={this.handleValueChange}
      />
    );
  }
}
