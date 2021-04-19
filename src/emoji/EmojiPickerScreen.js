/* @flow strict-local */

import React, { PureComponent } from 'react';
import { FlatList, Dimensions } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import * as api from '../api';
import { unicodeCodeByName } from './codePointMap';
import { Screen, Label } from '../common';
import EmojiWithTooltip from './EmojiWithTooltip';
import { getFilteredEmojis } from './data';
import type { RealmEmojiById, Auth, Dispatch, ReactionType, Orientation } from '../types';
import { connect } from '../react-redux';
import { getAuth, getActiveImageEmojiByName, getSession } from '../selectors';
import { navigateBack } from '../nav/navActions';
import zulipExtraEmojiMap from './zulipExtraEmojiMap';
import * as logging from '../utils/logging';
import { showToast } from '../utils/info';
import { createStyleSheet, BRAND_COLOR } from '../styles';

const styles = createStyleSheet({
  footerText: {
    textAlign: 'center',
    color: BRAND_COLOR,
    marginVertical: 5,
  },
  headerView: {
    marginTop: 12,
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'emoji-picker'>,
  route: RouteProp<'emoji-picker', {| messageId: number |}>,
  orientation: Orientation,

  activeImageEmojiByName: RealmEmojiById,
  auth: Auth,
  dispatch: Dispatch,
|}>;

type State = {|
  filter: string,
|};

/** number of columns in @Flatlist is screen-width divided by 20(size of emoji) + 12(padding) + 12 (padding)
 * 12(-_-)12  (12+12 =24 total horizontal padding), now total size of emojis a is 44 and (-1) to leave space of 1 more emoji
 *  to have enough padding between the matrix of emoji
 * Math.floor used as Flatlist not behaving well on float values returning by the calculation
 *
 * @var loadingText used with condition because when user search emojis then flatlist has max 2-3 rows
 * if the footer of Flatlist continue with "Loading ..." then with search result user would see "Loading"
 * and that's not good
 *
 * @param key in Flatlist useful in screen orientation changes
 * see https://github.com/facebook/react-native/issues/15944
 */
class EmojiPickerScreen extends PureComponent<Props, State> {
  state = {
    filter: '',
  };

  handleInputChange = (text: string) => {
    this.setState({
      filter: text.toLowerCase(),
    });
  };

  getReactionTypeAndCode = (
    emojiName: string,
  ): {| reactionType: ReactionType, emojiCode: string |} => {
    const { activeImageEmojiByName } = this.props;
    const imageEmoji = activeImageEmojiByName[emojiName];
    if (imageEmoji) {
      return {
        reactionType: zulipExtraEmojiMap[emojiName] ? 'zulip_extra_emoji' : 'realm_emoji',
        emojiCode: imageEmoji.code,
      };
    }
    return { reactionType: 'unicode_emoji', emojiCode: unicodeCodeByName[emojiName] };
  };

  addReaction = (emojiName: string) => {
    const { auth, route } = this.props;
    const { messageId } = route.params;

    const { reactionType, emojiCode } = this.getReactionTypeAndCode(emojiName);
    api.emojiReactionAdd(auth, messageId, reactionType, emojiCode, emojiName).catch(err => {
      logging.error('Error adding reaction emoji', err);
      showToast(`${err}`);
    });
    NavigationService.dispatch(navigateBack());
  };

  render() {
    const { activeImageEmojiByName } = this.props;
    const { filter } = this.state;

    const emojiNames = getFilteredEmojis(filter, activeImageEmojiByName);

    const loadingText = filter ? ' ' : 'Loading ...';
    const numColumn = Math.floor(Dimensions.get('window').width / 44 - 1);

    return (
      <Screen search scrollEnabled={false} searchBarOnChange={this.handleInputChange}>
        <FlatList
          columnWrapperStyle={{ justifyContent: 'space-around' }}
          ListFooterComponent={<Label style={styles.footerText} text={loadingText} />}
          keyboardShouldPersistTaps="always"
          initialNumToRender={12}
          numColumns={numColumn}
          data={emojiNames}
          key={numColumn}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <EmojiWithTooltip
              type={item.emoji_type}
              code={item.code}
              name={item.name}
              onPress={this.addReaction}
            />
          )}
        />
      </Screen>
    );
  }
}

export default connect(state => ({
  activeImageEmojiByName: getActiveImageEmojiByName(state),
  auth: getAuth(state),
  orientation: getSession(state).orientation,
}))(EmojiPickerScreen);
