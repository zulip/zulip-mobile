/* @flow strict-local */
import React, { useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import * as typeahead from '@zulip/shared/js/typeahead';

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
  }
};

/**
 * The enum's members, as an array in order of preference, with "stream".
 *
 * When a query matches more than one of these, choose the first one. For a
 * similar array that doesn't include WildcardMentionType.Stream, see
 * kOrderedTypesWithoutStream.
 */
// Greg points out:
//
// > The help center mentions @-all, sometimes also @-everyone, and never
// > @-stream that I can see:
// > https://zulip.com/help/mention-a-user-or-group
// > https://zulip.com/help/pm-mention-alert-notifications
// > So I think the right order of preference is [all, everyone, stream].
const kOrderedTypesWithStream = [
  WildcardMentionType.All,
  WildcardMentionType.Everyone,
  WildcardMentionType.Stream,
];

/**
 * The enum's members, as an array in order of preference, without "stream".
 *
 * When a query matches more than one of these, choose the first one. For a
 * similar array that includes WildcardMentionType.Stream, see
 * kOrderedTypesWithStream.
 */
// See implementation note at kOrderedTypesWithStream.
const kOrderedTypesWithoutStream = [WildcardMentionType.All, WildcardMentionType.Everyone];

export const getWildcardMentionsForQuery = (
  query: string,
  destinationNarrow: Narrow,
  _: GetText,
): $ReadOnlyArray<WildcardMentionType> => {
  // This assumes that we'll never want to show two suggestions for one query.
  // That's OK, as long as all of WildcardMentionType's members are synonyms,
  // and it's nice not to crowd the autocomplete with multiple items that mean
  // the same thing. But we'll need to adapt if it turns out that all the
  // members aren't synonyms.
  const match = (
    isStreamOrTopicNarrow(destinationNarrow) ? kOrderedTypesWithStream : kOrderedTypesWithoutStream
  ).find(
    type =>
      typeahead.query_matches_string(query, serverCanonicalStringOf(type), ' ')
      || typeahead.query_matches_string(query, _(englishCanonicalStringOf(type)), ' '),
  );
  return match != null ? [match] : [];
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
