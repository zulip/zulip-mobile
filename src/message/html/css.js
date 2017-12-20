/* eslint-disable */

import { BORDER_COLOR } from '../../styles/theme';
import { BRAND_COLOR, HALF_COLOR, REACTION_HEIGHT, REACTION_SPINNER_OFFSET } from '../../styles';

export default `
<style>
* {
  -webkit-user-select: none;
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
  text-decoration: none;
}
blockquote {
  padding-left: 5px;
  margin-left: 1em;
  border-left-color: #ddd;
}
code {
  font-size: .857em;
  color: black;
  background-color: #f7f7f9;
  border-radius: 3px;
  border: 1px solid #e1e1e8;
  white-space: pre-wrap;
  padding: 0 4px;
  font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
}
p {
  margin: 0 0 0.5em 0;
}
pre {
  padding: 0.5em;
  margin: 0;
  background-color: #f5f5f5;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 4px;
}
table {
  border-collapse: collapse;
}
table, th, td {
  border: 1px solid rgba(0, 0, 0, 0.1);
}
thead {
  background: rgba(0, 0, 0, 0.05);
}
th, td {
  align: center;
  padding: 0.25em 0.5em;
}
.subheader {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 0.5em;
}
.timerow {
  text-align: center;
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #999;
  display: flex;
  align-items: center;
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
  color: silver;
  font-size: 14px;
  line-height: 1;
}
.message {
  display: flex;
  word-wrap: break-word;
  margin: 0.5em;
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
  flex: 1;
  max-width: calc(100% - 32px - 0.5em);
  word-wrap: break-word;
}
.username {
  font-weight: bold;
  line-height: 1;
}
.user-mention {
  white-space: nowrap;
  background-color: #eee;
  border-radius: 3px;
  padding: 0 .2em;
  box-shadow: 0 0 0 1px #ccc;
}
.header {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}
.avatar,
.header {
  cursor: pointer;
}
.topic-header,
.private-header,
.stream-header {
  padding: 0.5em;
  margin-bottom: 1em;
}
.topic-header,
.stream-header {
  background: #e2e2e2;
}
.stream-header {
  padding: 0;
  display: flex;
  flex-direction: row;
}
.stream-text,
.title-text {
  padding: 0.5em;
  line-height: 1;
}
.title-text {
  flex: 1;
  padding-left: 0.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
}
.loading-avatar {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: #ddd;
  margin-right: 0.5em;
}
.loading-content {
  width: 100%;
}
.loading-subheader {
  display: flex;
  justify-content: space-between;
}
.loading-content .block {
  background-color: #eee;
  border-radius: 10px;
  height: 8px;
  margin-bottom: 10px;
}
.loading-subheader .name {
  width: 120px;
  background-color: #ddd;
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
  border: 3px solid rgba(0, 0, 0, 0.25);
  border-left: 3px solid rgba(0, 0, 0, 0.75);
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
.emoji {
  height: 25px;
  width: 25px;
  vertical-align: text-bottom;
}
blockquote {
  margin: 0.5em 0;
  border-left: 5px solid #ddd;
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
  margin: 1em 0;
}
.reaction {
  color: ${HALF_COLOR};
  padding: 4px;
  border-radius: 4px;
  border: 1px solid ${HALF_COLOR};
}
.self-voted {
  color: ${BRAND_COLOR};
  border: 1px solid ${BRAND_COLOR};
  background: rgba(36, 202, 194, 0.1);
}
</style>
`;
