/* @flow strict-local */
import React, { useContext } from 'react';
import { View } from 'react-native';

import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import { useDispatch } from '../react-redux';
import * as NavigationService from '../nav/NavigationService';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { createStyleSheet, ThemeContext } from '../styles';
import { ZulipButton, Screen, Label } from '../common';
import { IconWarning } from '../common/Icons';
import { deactivateUser, navigateBack } from '../actions';

const styles = createStyleSheet({
  deactivateText: {
    color: 'white',
  },
  deactivateButton: {
    margin: 8,
    backgroundColor: 'darkred',
  },
  button: {
    margin: 8,
  },
  warningWrapper: {
    flex: 1,
  },
  icon: {
    marginRight: 16,
  },
  warningTitle: {
    fontSize: 18,
  },
  warningTextList: {
    flexDirection: 'column',
  },
  warningTextItemWrapper: {
    flexDirection: 'row',
    paddingBottom: 8,
    paddingLeft: 64,
    paddingRight: 32,
  },
  warningTextItem: {
    fontSize: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
});

function DeactivateMyAccountButton(props: {||}) {
  const dispatch = useDispatch();

  return (
    <ZulipButton
      style={styles.deactivateButton}
      text="Deactivate"
      textStyle={styles.deactivateText}
      onPress={() => {
        dispatch(deactivateUser());
      }}
    />
  );
}

function CancelButton(props: {||}) {
  return (
    <ZulipButton
      style={styles.button}
      text="Cancel"
      onPress={() => {
        NavigationService.dispatch(navigateBack());
      }}
    />
  );
}

function ItemText(props: $ReadOnly<{| text: string |}>) {
  const context = useContext(ThemeContext);
  const text = props.text;
  return (
    <View style={styles.warningTextItemWrapper}>
      <Label style={[styles.warningTextItem, { color: context.color }]} text="- " />
      <Label style={[styles.warningTextItem, { color: context.color }]} text={text} />
    </View>
  );
}

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'account-deactivate'>,
  route: RouteProp<'account-deactivate', void>,
|}>;

export default function AccountDeactivateScreen(props: Props) {
  const context = useContext(ThemeContext);
  const _ = useContext(TranslationContext);

  return (
    <Screen
      title="Deactivate account"
      centerContent
      padding
      canGoBack
      shouldShowLoadingBanner={false}
    >
      <View style={styles.warningWrapper}>
        <View style={styles.listItem}>
          <IconWarning style={styles.icon} size={36} color="darkred" />
          <Label
            style={[styles.warningTitle, { color: context.color }]}
            text="What heppens if you deactivate your account"
          />
        </View>

        <View style={styles.warningTextList}>
          <ItemText
            text={_(
              "You will be Logged out immediately from Zulip, that includes Zulip's website, mobile, desktop, and terminal.",
            )}
          />
          <ItemText text={_('Disable any bots you maintain.')} />
          <ItemText
            text={_('Deactivating your account won\'t delete messages you\'ve sent or files you\'ve shared. If permitted in your organization, delete content you\'d like to remove before deactivating your account.')}
          />
          <ItemText text={_('You cannot register a Zulip account using the email address of a deactivated account in that organization. If you change your mind about deactivating an account, an organization administrator can reactivate your account at any time.')} />
        </View>
      </View>

      <DeactivateMyAccountButton />
      <CancelButton />
    </Screen>
  );
}
