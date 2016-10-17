import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import Logo from '../Logo';

it('renders correctly', () => {
  const tree = renderer.create(
    <Logo />
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
