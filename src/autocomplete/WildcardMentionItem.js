/* @flow strict-local */
import React, { useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import * as typeahead from '@zulip/shared/lib/typeahead';

import type { GetText, Narrow } from '../types';
import { IconWildcardMention } from '../common/Icons';
import ZulipText from '../common/ZulipText';
import Touchable from '../common/Touchable';
import { createStyleSheet, ThemeContext } from '../styles';
import { caseNarrowDefault, isStreamOrTopicNarrow } from '../utils/narrow';
import { TranslationContext } from '../boot/TranslationProvider';

/**
 * A type of wildcard mention recognized by the server.
 *
 * For the string the server knows this by, see serverCanonicalStringOf.
 *
 * See user doc on wildcard mentions:
 *   https://zulip.com/help/pm-mention-alert-notifications#wildcard-mentions
 */
export enum WildcardMentionType {
  // These values are arbitrary. For the string the server knows these by,
  // see serverCanonicalStringOf.
  All = 0,
  Everyone = 1,
  Stream = 2,
  Topic = 3,
}

/**
 * The canonical English string, like "everyone" or "all".
 *
 * See also serverCanonicalStringOf for the string the server knows this by.
 * (It might differ in a future where servers localize these.)
 */
// All of these should appear in messages_en.json so we can make the
// wildcard mentions discoverable in the people autocomplete in the client's
// own language. See getWildcardMentionsForQuery.
const englishCanonicalStringOf = (type: WildcardMentionType): string => {
  switch (type) {
    case WildcardMentionType.All:
      return 'all';
    case WildcardMentionType.Everyone:
      return 'everyone';
    case WildcardMentionType.Stream:
      return 'stream';
    case WildcardMentionType.Topic:
      return 'topic';
  }
};

/**
 * The string recognized by the server, like "everyone" or "all".
 *
 * Currently the same as englishCanonicalStringOf, but that should change if
 * servers start localizing these.
 */
const serverCanonicalStringOf = englishCanonicalStringOf;

const descriptionOf = (
  type: WildcardMentionType,
  destinationNarrow: Narrow,
  _: GetText,
): string => {
  switch (type) {
    case WildcardMentionType.All:
    case WildcardMentionType.Everyone:
      return caseNarrowDefault(
        destinationNarrow,
        { topic: () => _('Notify stream'), pm: () => _('Notify recipients') },
        // A "destination narrow" should really be a conversation narrow
        // (i.e., stream or topic), but including this default case is easy,
        // and better than an error/crash in case we've missed that somehow.
        () => _('Notify everyone'),
      );
    case WildcardMentionType.Stream:
      return _('Notify stream');
    case WildcardMentionType.Topic:
      return _('Notify topic');
  }
};

export const getWildcardMentionsForQuery = (
  query: string,
  destinationNarrow: Narrow,
  topicMentionSupported: boolean,
  _: GetText,
): $ReadOnlyArray<WildcardMentionType> => {
  const queryMatchesWildcard = (type: WildcardMentionType): boolean =>
    typeahead.query_matches_string(query, serverCanonicalStringOf(type), ' ')
    || typeahead.query_matches_string(query, _(englishCanonicalStringOf(type)), ' ');

  const results = [];

  // These three WildcardMentionType values are synonyms, so only show one.
  //
  // The help center mentions @-all, sometimes also @-everyone, and
  // apparently never @-stream:
  //   https://zulip.com/help/mention-a-user-or-group
  //   https://zulip.com/help/pm-mention-alert-notifications
  // So the right order of preference seems to be [all, everyone, stream].
  if (queryMatchesWildcard(WildcardMentionType.All)) {
    results.push(WildcardMentionType.All);
  } else if (queryMatchesWildcard(WildcardMentionType.Everyone)) {
    results.push(WildcardMentionType.Everyone);
  } else if (
    isStreamOrTopicNarrow(destinationNarrow)
    && queryMatchesWildcard(WildcardMentionType.Stream)
  ) {
    results.push(WildcardMentionType.Stream);
  }

  // Then show @-topic if it applies.
  if (
    topicMentionSupported
    && isStreamOrTopicNarrow(destinationNarrow)
    && queryMatchesWildcard(WildcardMentionType.Topic)
  ) {
    results.push(WildcardMentionType.Topic);
  }

  return results;
};

type Props = $ReadOnly<{|
  type: WildcardMentionType,
  destinationNarrow: Narrow,
  onPress: (type: WildcardMentionType, serverCanonicalString: string) => void,
|}>;

export default function WildcardMentionItem(props: Props): Node {
  const { type, destinationNarrow, onPress } = props;

  const _ = useContext(TranslationContext);

  const handlePress = useCallback(() => {
    onPress(type, serverCanonicalStringOf(type));
  }, [onPress, type]);

  const themeContext = useContext(ThemeContext);

  const styles = useMemo(
    () =>
      createStyleSheet({
        wrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 8,

          // Minimum touch target height:
          //   https://material.io/design/usability/accessibility.html#layout-and-typography
          minHeight: 48,
        },
        textWrapper: {
          flex: 1,
          marginLeft: 8,
        },
        text: {},
        descriptionText: {
          fontSize: 10,
          color: 'hsl(0, 0%, 60%)',
        },
      }),
    [],
  );

  return (
    <Touchable onPress={handlePress}>
      <View style={styles.wrapper}>
        <IconWildcardMention
          // Match the size of the avatar in UserItem, which also appears in
          // the people autocomplete. We're counting on this icon being a
          // square.
          size={32}
          color={themeContext.color}
        />
        <View style={styles.textWrapper}>
          <ZulipText
            style={styles.text}
            text={serverCanonicalStringOf(type)}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
          <ZulipText
            style={styles.descriptionText}
            text={descriptionOf(type, destinationNarrow, _)}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
        </View>
      </View>
    </Touchable>
  );
}
