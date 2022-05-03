/* @flow strict-local */
import React, { useState, useContext } from 'react';
import { Text, View, Platform, Picker, TouchableOpacity, ScrollView } from 'react-native';
import type { Node } from 'react';
import { ThemeContext, BRAND_COLOR } from '../styles';
import type { RouteProp } from '../react-navigation';
import * as api from '../api';
import Input from '../common/Input';
import { streamNarrow, streamIdOfNarrow } from '../utils/narrow';
import { getStreamForId } from '../subscriptions/subscriptionSelectors';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { getAuth, getStreams, getOwnUser } from '../selectors';
import { useSelector } from '../react-redux';
import { showErrorAlert, showToast } from '../utils/info';
import { Icon } from '../common/Icons';
import type { Narrow, Message, Outbox } from '../types';
import TopicAutocomplete from '../autocomplete/TopicAutocomplete';
import { TranslationContext } from '../boot/TranslationProvider';
import ZulipButton from '../common/ZulipButton';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'move-message'>,
  route: RouteProp<'move-message', {| message: Message | Outbox, messageNarrow: Narrow |}>,
|}>;

const inputMarginPadding = {
  paddingHorizontal: 8,
  paddingVertical: Platform.select({
    ios: 8,
    android: 2,
  }),
};

export default function MoveMessage(props: Props): Node {
  const themeContext = useContext(ThemeContext);
  const backgroundColor = themeContext.backgroundColor;
  const cardColor = themeContext.cardColor;
  const iconName = Platform.OS === 'android' ? 'arrow-left' : 'chevron-left';
  const auth = useSelector(getAuth);
  const allStreams = useSelector(getStreams);
  const isAdmin = useSelector(getOwnUser).is_admin;
  const messageId = props.route.params.message.id;
  const currentStreamId = streamIdOfNarrow(props.route.params.messageNarrow);
  const currentStreamName = useSelector(state => getStreamForId(state, currentStreamId)).name;
  const [narrow, setNarrow] = useState(streamNarrow(currentStreamId));
  const [subject, setSubject] = useState(props.route.params.message.subject);
  const [propagateMode, setPropagateMode] = useState('change_one');
  const [streamId, setStreamId] = useState(currentStreamId);
  const [topicFocus, setTopicFocus] = useState(false);
  const _ = useContext(TranslationContext);

  const styles = {
    parent: {
      backgroundColor: cardColor,
    },
    layout: {
      margin: 10,
    },
    title: {
      fontSize: 18,
      color: backgroundColor === 'white' ? 'black' : 'white',
    },
    topicInput: {
      height: 50,
      backgroundColor,
      ...inputMarginPadding,
    },
    viewTitle: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 50,
      paddingHorizontal: 10,
      marginBottom: 20,
    },
    textColor: {
      color: backgroundColor === 'white' ? 'black' : 'white',
    },
    picker: { backgroundColor, marginBottom: 20 },
    submitButton: {
      marginTop: 10,
      paddingTop: 15,
      paddingBottom: 15,
      marginLeft: 30,
      marginRight: 30,
      backgroundColor: BRAND_COLOR,
      borderRadius: 10,
      borderWidth: 1,
    },
  };

  const handleTopicChange = (topic: string) => {
    setSubject(topic);
  };

  const handleTopicFocus = () => {
    setTopicFocus(true);
  };

  const setTopicInputValue = (topic: string) => {
    handleTopicChange(topic);
    setTopicFocus(false);
  };

  const handleTopicAutocomplete = (topic: string) => {
    setTopicInputValue(topic);
  };

  const updateMessage = () => {
    try {
      if (isAdmin) {
        api.updateMessage(auth, messageId, {
          subject,
          stream_id: streamId,
          propagate_mode: propagateMode,
        });
      } else {
        api.updateMessage(auth, messageId, { subject, propagate_mode: propagateMode });
      }
    } catch (error) {
      showErrorAlert(_('Failed to move message'), error.message);
      props.navigation.goBack();
      return;
    }
    props.navigation.goBack();
    showToast(_('Moved message'));
  };

  const handleNarrow = (pickedStreamId: number) => {
    setStreamId(pickedStreamId);
    setNarrow(streamNarrow(pickedStreamId));
  };

  return (
    <ScrollView style={styles.parent}>
      <View style={styles.layout}>
        <View style={styles.viewTitle}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Icon size={20} color="gray" name={iconName} />
          </TouchableOpacity>
          <Text style={styles.title}>Move Message</Text>
          <View />
        </View>
        <Text style={{ fontSize: 14, color: 'gray', marginBottom: 10 }}>Stream:</Text>
        {isAdmin ? (
          <View style={styles.picker}>
            <Picker
              selectedValue={currentStreamName}
              onValueChange={(itemValue, itemIndex) => handleNarrow(parseInt(itemValue, 10))}
              style={styles.textColor}
            >
              {allStreams.map(item => (
                <Picker.Item label={item.name} value={item.stream_id.toString()} />
              ))}
            </Picker>
          </View>
        ) : (
          <Text style={[styles.textColor, { marginBottom: 10 }]}>{currentStreamName}</Text>
        )}
        <Text style={{ fontSize: 14, color: 'gray', marginBottom: 10 }}>Topic:</Text>
        <View style={{ marginBottom: 20 }}>
          <Input
            underlineColorAndroid="transparent"
            placeholder="Topic"
            autoFocus={false}
            defaultValue={subject}
            selectTextOnFocus
            onChangeText={value => handleTopicChange(value)}
            onFocus={handleTopicFocus}
            blurOnSubmit={false}
            returnKeyType="next"
            style={styles.topicInput}
          />
          <TopicAutocomplete
            isFocused={topicFocus}
            narrow={narrow}
            text={subject}
            onAutocomplete={handleTopicAutocomplete}
          />
        </View>
        <Text style={{ fontSize: 14, color: 'gray', marginBottom: 10 }}>Move options:</Text>
        <View style={styles.picker}>
          <Picker
            selectedValue={propagateMode}
            // $FlowFixMe[incompatible-call] : the itemValue will always be one of these values - change_one | change_later | change_all
            onValueChange={(itemValue, itemIndex) => setPropagateMode(itemValue)}
            style={styles.textColor}
          >
            <Picker.Item label="Change only this message" value="change_one" />
            <Picker.Item label="Change later messages to this topic" value="change_later" />
            <Picker.Item
              label="Change previous and following messages to this topic"
              value="change_all"
            />
          </Picker>
        </View>
        <Text style={{ fontSize: 14, marginBottom: 10, color: 'gray' }}>Content:</Text>
        <Text style={[styles.textColor, { marginBottom: 20 }]}>
          {props.route.params.message.content.replace(/<(?:.|\n)*?>/gm, '')}
        </Text>
        <ZulipButton
          style={{ flex: 1, margin: 8 }}
          secondary={false}
          text="Submit"
          onPress={updateMessage}
        />
      </View>
    </ScrollView>
  );
}
