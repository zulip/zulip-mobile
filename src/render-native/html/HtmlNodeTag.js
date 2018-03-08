/* @flow */
import React, { PureComponent } from 'react';

import type { Auth, Message, Actions, StyleObj } from '../../types';
import connectWithActions from '../../connectWithActions';
import { getEmojiUrl } from '../../utils/url';
import { getSession, getOwnEmail } from '../../selectors';
import styles from './HtmlStyles';
import cascadingStyles from './cascadingStylesView';
import cascadingStylesText from './cascadingStylesText';
import indexedStyles from './indexedStyles';
import indexedViewsStyles from './indexedViewsStyles';
import textStylesFromClass from './textStylesFromClass';
import HtmlTagSpan from '../tags/HtmlTagSpan';
import HtmlTagSpanMention from '../tags/HtmlTagSpanMention';
import HtmlTagA from '../tags/HtmlTagA';
import HtmlTagDiv from '../tags/HtmlTagDiv';
import HtmlTagLi from '../tags/HtmlTagLi';
import HtmlTagImg from '../tags/HtmlTagImg';
import HtmlTagPre from '../tags/HtmlTagPre';
import HtmlTagStrong from '../tags/HtmlTagStrong';
import HtmlTagItalic from '../tags/HtmlTagItalic';

const specialTags = {
  span: HtmlTagSpan,
  p: HtmlTagSpan,
  code: HtmlTagSpan,
  a: HtmlTagA,
  li: HtmlTagLi,
  img: HtmlTagImg,
  pre: HtmlTagPre,
  strong: HtmlTagStrong,
  b: HtmlTagStrong,
  em: HtmlTagItalic,
  i: HtmlTagItalic,
  div: HtmlTagDiv,
};

const stylesFromClassNames = (classNames: string = '', styleObj) =>
  classNames.split(' ').map(className => styleObj[className]);

type Props = {
  auth: Auth,
  attribs: Object,
  name: string,
  cascadingStyle: StyleObj,
  cascadingTextStyle: StyleObj,
  childrenNodes: Object[],
  ownEmail: string,
  message: Message,
  actions: Actions,
  splitMessageText: boolean,
  onPress: () => void,
};

class HtmlNodeTag extends PureComponent<Props> {
  props: Props;

  render() {
    const {
      auth,
      actions,
      attribs,
      name,
      cascadingStyle,
      cascadingTextStyle,
      childrenNodes,
      onPress,
      message,
      ownEmail,
      splitMessageText,
    } = this.props;
    const style = [styles[name], ...stylesFromClassNames(attribs.class, styles)];
    const newCascadingStyle = [
      cascadingStyle,
      cascadingStyles[name],
      ...stylesFromClassNames(attribs.class, cascadingStyles),
    ];
    const newCascadingStylesText = [
      cascadingTextStyle,
      cascadingStylesText[name],
      ...stylesFromClassNames(attribs.class, textStylesFromClass),
    ];
    const newIndexedStyles = indexedStyles[name];
    const newIndexedViewsStyles = indexedViewsStyles[name];

    let HtmlComponent = specialTags[name] || HtmlTagSpan;

    if (attribs.class) {
      if (attribs.class.startsWith('emoji emoji-')) {
        HtmlComponent = HtmlTagImg;
        attribs.src = getEmojiUrl(attribs.class.split('-').pop());
      } else if (attribs.class === 'user-mention' && attribs['data-user-email'] === ownEmail) {
        HtmlComponent = HtmlTagSpanMention;
      }
    }

    return (
      <HtmlComponent
        auth={auth}
        attribs={attribs}
        name={name}
        actions={actions}
        target={attribs.target}
        src={attribs.src}
        href={attribs.href}
        className={attribs.class}
        style={[styles.common, style]}
        cascadingStyle={newCascadingStyle}
        cascadingTextStyle={newCascadingStylesText}
        indexedViewsStyles={newIndexedViewsStyles}
        indexedStyles={newIndexedStyles}
        childrenNodes={childrenNodes}
        onPress={onPress}
        message={message}
        splitMessageText={splitMessageText}
      />
    );
  }
}

export default connectWithActions(state => ({
  ownEmail: getOwnEmail(state),
  splitMessageText: getSession(state).debug.splitMessageText,
}))(HtmlNodeTag);
