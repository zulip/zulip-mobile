import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Image } from 'react-native';
import {
  Avatar,
  Title,
  Caption,
  Paragraph,
  Drawer,
  Text,
  TouchableRipple,
} from 'react-native-paper';

import styles from './DrawerContent.style.js';
import { TopTabButton, TopTabButtonGeneral } from '../nav/TopTabButton';
import { HOME_NARROW, MENTIONED_NARROW, STARRED_NARROW } from '../utils/narrow';
import { doNarrow, navigateToSearch } from '../actions';
import IconUnreadMentions from '../nav/IconUnreadMentions';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { useSelector, useDispatch } from '../react-redux';
import * as NavigationService from '../nav/NavigationService';
import { getAccountStatuses, getRealm } from '../selectors';

type SelectorProps = $ReadOnly<{|
  realm_name: string,
|}>;

const DrawerContent = ({ navigation, ...props }) => {
  const accounts = useSelector(getAccountStatuses);
  const realm_name = useSelector(state => getRealm(state).realm_name);
  const dispatch = useDispatch();
  const { realm, isLoggedIn } = accounts[0];

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView showsVerticalScrollIndicator={false} {...props}>
        <View style={{ flex: 1 }}>
          <Image source={require('../../static/img/logo.png')} style={styles.logoImage} />
          {realm_name && (
            <View style={styles.realmView}>
              <Text style={styles.realmName}>{realm_name.toString()}</Text>
              <Text style={styles.realmUrl}>{realm.toString()}</Text>
            </View>
          )}
          <Drawer.Section>
            <DrawerItem
              icon={() => <TopTabButton name="globe" />}
              label="All messages"
              onPress={() => {
                dispatch(doNarrow(HOME_NARROW));
              }}
            />
            <DrawerItem
              icon={() => <TopTabButton name="star" />}
              label="Starred messages"
              onPress={() => {
                dispatch(doNarrow(STARRED_NARROW));
              }}
            />
            <DrawerItem
              icon={() => (
                <TopTabButtonGeneral>
                  <IconUnreadMentions color={BRAND_COLOR} />
                </TopTabButtonGeneral>
              )}
              label="Mentions"
              onPress={() => {
                dispatch(doNarrow(MENTIONED_NARROW));
              }}
            />
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

export default DrawerContent;
