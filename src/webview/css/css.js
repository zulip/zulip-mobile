/* @flow strict-local */
import type { ThemeName } from '../../types';
import { BRAND_COLOR } from '../../styles';
import cssEmojis from './cssEmojis';
import cssNight from './cssNight';

const cssBase = `
html {
  -webkit-user-select: none; /* Safari 3.1+ */
  -moz-user-select: none; /* Firefox 2+ */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Standard syntax */
  -khtml-user-select: none;
  -webkit-touch-callout: none;
}
body {
  font-family: sans-serif;
  line-height: 1.4;
  margin: 0;
  width: 100%;
  max-width: 100%;
}
a {
  color: #08c;
}
p {
  margin: 0;
}
code {
  font-size: .857rem;
  white-space: pre-wrap;
  padding: 0 4px;
}
pre {
  padding: 8px;
  margin: 8px 0;
  font-size: 0.75rem;
  white-space: pre;
  overflow-x: auto;
  word-wrap: normal;
}
code, pre {
  border-radius: 0.2rem;
  border: 1px solid rgba(127, 127, 127, 0.25);
  background-color: rgba(127, 127, 127, 0.125);
  font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
}
table {
  border-collapse: collapse;
  width: 100%;
}
table, th, td {
  border: 1px solid rgba(127, 127, 127, 0.25);
}
thead {
  background: rgba(127, 127, 127, 0.1);
}
th, td {
  align: center;
  padding: 4px 8px;
}
hr {
  margin: 16px 0;
  border: 0;
  border-top: 1px solid rgba(127, 127, 127, 0.5);
}
.alert-word {
  background-color: hsla(102, 85%, 57%, .5);
}
.highlight {
  background-color: hsl(51, 94%, 74%);
}
.subheader {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 4px;
}
.timerow {
  text-align: center;
  color: #999;
  display: flex;
  align-items: center;
  padding: 8px 0;
}
.timerow-left,
.timerow-right {
  flex: 1;
  height: 1px;
  margin: 8px;
}
.timerow-left {
  background: -webkit-linear-gradient(left, transparent 10%, #999 100%);
}
.timerow-right {
  background: -webkit-linear-gradient(left, #999 0%, transparent 90%);
}
.timestamp {
  color: #999;
  font-size: 0.9rem;
  white-space: nowrap;
}
.message,
.loading {
  display: flex;
  word-wrap: break-word;
  padding: 16px;
}
.message-brief {
  margin-left: 72px;
}
.message p + p {
  margin-top: 16px;
}
.avatar,
.loading-avatar {
  min-width: 32px;
  width: 32px;
  height: 32px;
  margin-right: 16px;
}
.avatar img {
  width: 100%;
  border-radius: 3px;
}
.content {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}
.username {
  font-weight: bold;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.user-group-mention,
.user-mention {
  white-space: nowrap;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 0.2rem;
  padding: 0 4px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}
.header-wrapper {
  position: -webkit-sticky;
  position: sticky;
  top: -1px;
  padding: 8px;
  z-index: 100;
  display: flex;
  justify-content: space-between;
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
.topic-header,
.private-header {
  padding: 0 8px;
  line-height: 2;
  white-space: nowrap;
}
.private-header {
  padding: 0 0.5rem;
}
.topic-header {
.private-header {
  padding: 0 8px;
}
.topic-header {
  background: #ccc;
  min-width: 30%;
}
.stream-text {
  padding: 0 0.5rem;
}
.topic-text {
  flex: 1;
  padding: 0 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}
.topic-date {
  opacity: 0.5;
  padding: 0 0.5rem;
  pointer-events: none;
}
[data-mentioned="true"], [data-wildcard_mentioned="true"] {
  box-shadow: inset 8px 0 rgba(255, 0, 0, 0.2);
}
.message:not([data-read="true"]) {
  box-shadow: inset 4px 0 ${BRAND_COLOR};
}
.message[data-read="true"] {
  box-shadow: inset 4px 0 transparent;
  transition-property: box-shadow;
  transition-duration: 0.3s;
  transition-delay: 1s;
  transition-timing-function: ease-out;
}
.private-header {
  background: #444;
  color: white;
}
.loading-avatar {
  border-radius: 3px;
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

  border-radius: 0.25rem;
  height: 8px;
  margin-bottom: 8px;
}
@keyframes gradient-scroll {
  0% { background-position: 100% 50% }
  100% { background-position: 0 50% }
}
.loading-subheader .name {
  width: 10rem;
  background-color: rgba(127, 127, 127, 0.9);
}
.loading-subheader .timestamp {
  width: 5rem;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.loading-spinner, .outbox-spinner {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin: 16px auto;
  font-size: 10px;
  border: 3px solid rgba(82, 194, 175, 0.25);
  border-left: 3px solid rgba(82, 194, 175, 0.75);
  animation: spin 1s linear infinite;
}
.outbox-spinner {
  margin: -16px 0 0 0;
  border-width: 2px;
  width: 12px;
  height: 12px;
  float: right;
}
.message_inline_image {
  text-align: center;
}
.message_inline_image img,
.message_inline_ref img,
.twitter-image img {
  width: 100%;
  height: 30vh;
  object-fit: contain;
}
blockquote {
  padding-left: 8px;
  margin: 8px 0 8px 0;
  border-left: 0.2rem solid rgba(127, 127, 127, 0.5);
}
.message ul {
  padding-left: 20px;
  margin: 4px 0 0 0;
}
.message ul + p {
  margin-top: 16px;
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
  border: 2px solid rgba(29, 161, 242, 0.5);
  background: rgba(29, 161, 242, 0.1);
  border-radius: 0.4rem;
  padding: 8px 16px;
  margin: 8px 0;
}
.twitter-avatar {
  border-radius: 0.2rem;
  margin: 8px 8px 4px 0;
  float: left;
  width: 2.2rem;
  height: 2.2rem;
}
.twitter-image {
  text-align: center;
  margin: 8px auto;
}
.message-tags {
  text-align: right;
  margin: 4px 0;
  font-size: 0.7rem;
}
.message-tag {
  padding: 3px 5px;
  margin-left: 4px;
  border-radius: 0.2rem;
  color: rgba(127, 127, 127, 0.75);
  background: rgba(0, 0, 0, 0.1);
}
.reaction-list {
  margin: 8px 0;
}
.reaction {
  color: rgba(127, 127, 127, 1);
  display: inline-block;
  padding: 8px;
  border-radius: 0.2rem;
  border: 1px solid rgba(127, 127, 127, 0.75);
  line-height: 1rem;
  height: 1rem;
  margin: 4px 8px 4px 0;
}
.reaction img {
  pointer-events: none;
  cursor: default;
  max-height: 1rem;
  max-width: 1rem;
  vertical-align: top;
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
  height: 1.2rem;
  width: 1.2rem;
  white-space: nowrap;
  color: transparent;
  vertical-align: text-top;
}
.emoji:before {
  color: white;
}
.widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(127, 127, 127, 0.1);
  border: 1px dashed rgba(127, 127, 127, 0.5);
  border-radius: 0.5rem;
}
#typing {
  display: flex;
  padding-left: 16px;
}
#typing .content {
  padding-top: 8px;
  padding-bottom: 16px;
}
#typing span {
  display: inline-block;
  background-color: #B6B5BA;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 100%;
  margin-right: 8px;
  animation: bob 2s infinite;
}
#typing span:nth-child(2) {
  animation-delay: 0.15s;
}
#typing span:nth-child(3) {
  animation-delay: 0.3s;
  margin-right: 0;
}
@keyframes bob {
  10% {
    transform: translateY(-10px);
    background-color: #9E9DA2;
  }
  50% {
    transform: translateY(0);
    background-color: #B6B5BA;
  }
}
#message-loading {
  position: fixed;
  width: 100%;
  opacity: 0.25;
}
#js-error-detailed {
  position: fixed;
  width: 100%;
  background: red;
  color: white;
  font-size: 0.7rem;
}
#js-error-plain, #js-error-plain-dummy {
  z-index: 1000;
  width: 100%;
  background: red;
  color: white;
  padding: 4px;
  text-align: center;
}
#js-error-plain {
  position: fixed;
}
#js-error-plain-dummy {
  visibility: hidden;
}
#scroll-bottom {
  position: fixed;
  z-index: 200;
  right: 8px;
  bottom: 8px;
}
#scroll-bottom a {
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(82, 194, 175, 0.5);
}
#scroll-bottom .text {
  clip: rect(0 0 0 0);
  overflow: hidden;
  position: absolute;
  height: 1px;
  width: 1px;
}
#scroll-bottom svg {
  width: 32px;
  height: 32px;
  fill: rgba(255, 255, 255, 0.75);
}
`;

export default (theme: ThemeName) => `
<style>
${cssBase}
${theme === 'night' ? cssNight : ''}
${cssEmojis}
</style>
<style id="style-hide-js-error-plain">
#js-error-plain, #js-error-plain-dummy {
  display: none;
}
</style>
<style id="generated-styles"></style>
`;
