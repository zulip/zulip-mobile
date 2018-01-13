/* eslint-disable */
import { codeToEmojiMap } from '../emoji/emojiMap';

import { BORDER_COLOR } from '../styles/theme';
import { BRAND_COLOR, HALF_COLOR, REACTION_HEIGHT, REACTION_SPINNER_OFFSET } from '../styles';
import cssEmojis from './cssEmojis';

const defaultTheme = `
html {
  -webkit-user-select: none; /* Safari 3.1+ */
  -moz-user-select: none; /* Firefox 2+ */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Standard syntax */
}
body {
  font-family: sans-serif;
  line-height: 1.4;
  margin: 0;
}
body {
  font-size: 15px;
}
a {
  color: #08c;
}
p {
  margin: 0;
}
code {
  font-size: .857em;
  white-space: pre-wrap;
  padding: 0 0.25em;

}
pre {
  padding: 0.5em;
  margin: 0.5em 0;
  font-size: 0.75em;
  overflow: scroll-x;
}
code, pre {
  border-radius: 3px;
  border: 1px solid rgba(127, 127, 127, 0.25);
  background-color: rgba(127, 127, 127, 0.125);
  font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
}
table {
  border-collapse: collapse;
}
table, th, td {
  border: 1px solid rgba(127, 127, 127, 0.25);
}
thead {
  background: rgba(127, 127, 127, 0.1);
}
th, td {
  align: center;
  padding: 0.25em 0.5em;
}
#message-list {
  max-width: 100%;
  overflow: hidden;
}
.subheader {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 0.25em;
}
.timerow {
  text-align: center;
  color: #999;
  display: flex;
  align-items: center;
  padding: 0.5em 0;
}
.timerow-left,
.timerow-right {
  flex: 1;
  height: 1px;
  margin: 0.5em;
}
.timerow-left {
  background: -webkit-linear-gradient(left, transparent 10%, #999 100%);
}
.timerow-right {
  background: -webkit-linear-gradient(left, #999 0%, transparent 90%);
}
.timestamp {
  color: #999;
  font-size: 14px;
  line-height: 1;
}
.message {
  display: flex;
  word-wrap: break-word;
  padding: 0.5em;
}
.message-brief {
  padding: 0 0.5em 0.5em 3.5em;
}
.avatar {
  min-width: 2.5em;
  width: 2.5em;
  height: 2.5em;
  margin-right: 0.5em;
}
.avatar img {
  width: 100%;
  border-radius: 4px;
}
.content {
  width: 100%;
  max-width: 100%;
  overflow: scroll-x;
}
.username {
  font-weight: bold;
  line-height: 1;
}
.user-mention {
  white-space: nowrap;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  padding: 0 .2em;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}
.header-wrapper {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  padding: 0.5em;
}
.avatar,
.header-wrapper {
  cursor: pointer;
}
.stream-header {
  padding: 0;
  display: flex;
  flex-direction: row;
}
.stream-text,
.topic-text {
  padding: 0.5em;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.topic-text {
  flex: 1;
  padding-left: 0.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #ccc;
}
[data-mentioned="true"], [data-wildcard_mentioned="true"] {
  background: rgba(255, 0, 0, 0.05);
}
.message:not([data-read="true"]) {
}
.arrow-right {
  width: 0;
  height: 0;
  border-top: 1em solid transparent;
  border-bottom: 1em solid transparent;
  border-left: 1em solid green;
}
.private-header {
  background: #444;
  color: white;
  padding: 0.5em;
  line-height: 1;
}
.loading-avatar {
  min-width: 2.5em;
  width: 2.5em;
  height: 2.5em;
  margin-right: 0.5em;
  border-radius: 4px;
  background: rgba(127, 127, 127, 0.9);
}
.loading-content {
  width: 100%;
}
.loading-subheader {
  display: flex;
  justify-content: space-between;
}
.loading-content .block {
  background: linear-gradient(
    to right,
    rgba(127, 127, 127, 0.5) 0%,
    rgba(127, 127, 127, 0.5) 40%,
    rgba(127, 127, 127, 0.25) 51%,
    rgba(127, 127, 127, 0.5) 60%,
    rgba(127, 127, 127, 0.5) 100%
  );
  background-size: 200% 200%;
	animation: gradient-scroll 1s linear infinite;

  border-radius: 10px;
  height: 8px;
  margin-bottom: 10px;
}
@keyframes gradient-scroll {
	0% { background-position: 100% 50% }
	100% { background-position: 0 50% }
}
.loading-subheader .name {
  width: 120px;
  background-color: rgba(127, 127, 127, 0.9);
}
.loading-subheader .timestamp {
  width: 60px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.loading-spinner {
  width: 3em;
  height: 3em;
  border-radius: 50%;
  margin: 1em auto;
  font-size: 10px;
  position: relative;
  border: 3px solid rgba(82, 194, 175, 0.25);
  border-left: 3px solid rgba(82, 194, 175, 0.75);
  animation: spin 1s linear infinite;
}
.message_inline_image {
  text-align: center;
}
.message_inline_image img {
  // width: 75px;
  // height: 100px;
  max-width: 50vw;
  max-height: 50vh;
}
blockquote {
  padding-left: 0.5em;
  margin: 0.5em 0 0.5em 0;
  border-left: 3px solid rgba(127, 127, 127, 0.5);
}
ul {
  padding-left: 1em;
  margin: 0.5em 0;
}
.codehilite .gi { color: #00a000; }
.codehilite .gd { color: #a00000; }
.codehilite .k { color: #008000; font-weight: bold; }
.codehilite .kd { color: #008000; font-weight: bold; }
.codehilite .nf { color: #00f; }
.codehilite .s2 { color: #ba2121; }
.codehilite .cp { color: #bc7a00; }
.codehilite .kt { color: #b00040; }
.codehilite .nc { color: #00f; font-weight: bold; }
.codehilite .nb { color: #008000; }
.codehilite .s1 { color: #ba2121; }
.twitter-tweet {
}
.twitter-avatar {
  float: left;
  width: 32px;
  height: 32px;
  margin-right: .75em;
}
.fixed-header {
  position: fixed;
  top: 0;
  width: 100%;
  margin: 0;
}
.message-tags {
  text-align: right;
  margin: 0.25em 0;
  font-size: 10px;
}
.message-tag {
  padding: 0.25em 0.5em;
  margin-left: 4;
  border-radius: 2px;
  color: rgba(127, 127, 127, 0.75);
  background: rgba(0, 0, 0, 0.1);
}
.reaction-list {
  line-height: 2;
  margin: 0.5em 0;
}
.reaction {
  color: ${HALF_COLOR};
  padding: 4px;
  border-radius: 4px;
  border: 1px solid ${HALF_COLOR};
}
.reaction + .reaction {
  margin-left: 0.5em;
}
.self-voted {
  color: ${BRAND_COLOR};
  border: 1px solid ${BRAND_COLOR};
  background: rgba(36, 202, 194, 0.1);
}
.hidden {
  display: none;
}
.emoji {
  display: inline-block;
  height: 18px;
  width: 18px;
  white-space: nowrap;
  color: transparent;
  vertical-align: middle;
  transform: scale(1.2);
}
.emoji:before {
  color: white;
}
#typing {
  margin: 0.5em;
}
.typing-list {
  background: green;
  height: 20px;
}
#message-loading {
  opacity: 0.25;
}
#js-error {
  background: red;
  color: white;
  font-size: 10px;
}
`;

const darkTheme = `
body {
  color: #d5d9dd;
  background: #212D3B;
}

.topic-text {
  background: #54606E;
}
`;

export default (theme: ThemeType) => `
<style>
${defaultTheme}
${theme === 'night' ? darkTheme : ''}
${cssEmojis}
</style>
`;
