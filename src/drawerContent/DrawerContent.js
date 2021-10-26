import React from 'react'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { View, Image } from 'react-native'
import { Avatar, Title, Caption, Paragraph, Drawer, Text, TouchableRipple } from 'react-native-paper';

import styles from './DrawerContent.style.js'
import { TopTabButton, TopTabButtonGeneral } from '../nav/TopTabButton';
import { HOME_NARROW, MENTIONED_NARROW, STARRED_NARROW } from '../utils/narrow';
import { doNarrow, navigateToSearch } from '../actions';
import IconUnreadMentions from '../nav/IconUnreadMentions';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { useDispatch } from '../react-redux';


const DrawerContent = ({ navigation, ...props }) => {

    const dispatch = useDispatch();

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView showsVerticalScrollIndicator={false} {...props}>
                <View style={{ flex: 1 }}>
                    <Image
                        source={require('../../static/img/logo.png')}
                        style={styles.logoImage}
                    />
                    <Drawer.Section>
                        <DrawerItem
                            icon={() => (
                                <TopTabButton
                                    name="globe"
                                    onPress={() => {
                                        dispatch(doNarrow(HOME_NARROW));
                                    }}
                                />
                            )}
                            label="All Messages"
                        />
                        <DrawerItem
                            icon={() => (
                                <TopTabButton
                                    name="star"
                                    onPress={() => {
                                        dispatch(doNarrow(STARRED_NARROW));
                                    }}
                                />
                            )}
                            label="Favourites"
                        />
                        <DrawerItem
                            icon={() => (
                                <TopTabButtonGeneral
                                    onPress={() => {
                                        dispatch(doNarrow(MENTIONED_NARROW));
                                    }}
                                >
                                    <IconUnreadMentions color={BRAND_COLOR} />
                                </TopTabButtonGeneral>
                            )}
                            label="Mentions"
                        />
                        <DrawerItem
                            icon={() => (
                                <TopTabButton
                                    name="search"
                                    onPress={() => {
                                        NavigationService.dispatch(navigateToSearch());
                                    }}
                                />
                            )}
                            label="Search"
                        />
                    </Drawer.Section>
                </View>
            </DrawerContentScrollView>
        </View>
    )
}

export default DrawerContent