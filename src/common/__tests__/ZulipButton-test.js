import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import ZulipButton from '../ZulipButton';

it('renders correctly', () => {
  const tree = renderer.create(
    <ZulipButton />
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
