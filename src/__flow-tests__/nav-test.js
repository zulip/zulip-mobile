/**
 * Type-tests for navigation.
 *
 * @flow strict-local
 */

import React, { type ComponentType } from 'react';
import { createStackNavigator, type StackNavigationProp } from '@react-navigation/stack';

import { type RouteProp, type RouteParamsOf } from '../react-navigation';

// Test that `RouteProp` gives route.params the right type.
function testRouteParamTypes() {
  type ProfileProps = {|
    // skip navigation
    +route: RouteProp<'Profile', {| +userId: string |}>,
  |};

  function Profile(props: ProfileProps) {
    const { params } = props.route;

    (params.userId: string);
    // $FlowExpectedError[incompatible-cast]
    (params.userId: empty);

    (('a': string): typeof params.userId);
    // $FlowExpectedError[incompatible-cast]
    (('a': mixed): typeof params.userId);

    // $FlowExpectedError[prop-missing]
    params.nonsense;
  }
}

// Test that `RouteProp` gives type-checking of the route name
// at the navigator.
function testNavigatorTypes() {
  // (The setup of this one is a bit cumbersome because we need to set up
  // the navigator.)

  type ProfileProps = {|
    +navigation: NavigationProp<'Profile'>,
    +route: RouteProp<'Profile', {| +userId: string |}>,
  |};
  declare var Profile: ComponentType<ProfileProps>;

  declare var Profile12: ComponentType<{|
    +navigation: NavigationProp<'Profile1'>,
    +route: RouteProp<'Profile2', {| +userId: string |}>,
  |}>;

  type NavParamList = {|
    Profile: RouteParamsOf<typeof Profile>,
    Profile1: RouteParamsOf<typeof Profile12>,
    Profile2: RouteParamsOf<typeof Profile12>,
  |};

  // prettier-ignore
  type NavigationProp<+RouteName: $Keys<NavParamList> = $Keys<NavParamList>> =
    StackNavigationProp<NavParamList, RouteName>;

  const Stack = createStackNavigator<NavParamList, NavParamList, NavigationProp<>>();

    <Stack.Navigator>
      {/* Happy case is happy */}
      <Stack.Screen name="Profile" component={Profile} />
      {/* $FlowExpectedError[incompatible-type] - mismatch of name with route prop */}
      <Stack.Screen name="Profile1" component={Profile12} />
      {/* Should error but doesn't! on mismatch of name with navigation prop */}
      <Stack.Screen name="Profile2" component={Profile12} />
    </Stack.Navigator>;
}
