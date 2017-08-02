/* eslint-disable camelcase*/

import parseMarkdown from '../parseMarkdown';

const testCases = [
  { input: 'hello', expected: '<p>hello</p>' },
  { input: 'hello there', expected: '<p>hello there</p>' },
  { input: 'hello **bold** for you', expected: '<p>hello <strong>bold</strong> for you</p>' },
  { input: '__hello__', expected: '<p>__hello__</p>' },
  {
    input: '\n```\nfenced code\n```\n\nand then after\n',
    expected:
      '<div class="codehilite"><pre><span></span>fenced code\n</pre></div>\n\n\n<p>and then after</p>',
  },
  {
    input: '\n```\n    fenced code trailing whitespace            \n```\n\nand then after\n',
    expected:
      '<div class="codehilite"><pre><span></span>    fenced code trailing whitespace\n</pre></div>\n\n\n<p>and then after</p>',
  },
  {
    input: '* a\n* list \n* here',
    expected: '<ul>\n<li>a</li>\n<li>list </li>\n<li>here</li>\n</ul>',
  },
  {
    input: '\n```c#\nfenced code special\n```\n\nand then after\n',
    expected:
      '<div class="codehilite"><pre><span></span>fenced code special\n</pre></div>\n\n\n<p>and then after</p>',
  },
  {
    input: '\n```vb.net\nfenced code dot\n```\n\nand then after\n',
    expected:
      '<div class="codehilite"><pre><span></span>fenced code dot\n</pre></div>\n\n\n<p>and then after</p>',
  },
  {
    input: 'Some text first\n* a\n* list \n* here\n\nand then after',
    expected:
      '<p>Some text first</p>\n<ul>\n<li>a</li>\n<li>list </li>\n<li>here</li>\n</ul>\n<p>and then after</p>',
  },
  {
    input: '1. an\n2. ordered \n3. list',
    expected: '<p>1. an<br>\n2. ordered<br>\n3. list</p>',
  },
  {
    input: '\n~~~quote\nquote this for me\n~~~\nthanks\n',
    expected: '<blockquote>\n<p>quote this for me</p>\n</blockquote>\n<p>thanks</p>',
  },
  {
    input: 'This is a @**Cordelia Lear** mention',
    expected:
      '<p>This is a <span class="user-mention" data-user-id="101">@Cordelia Lear</span> mention</p>',
  },
  {
    input: 'These @ @**** are not mentions',
    expected: '<p>These @ @<em>**</em> are not mentions</p>',
  },
  {
    input: 'These # #**** are not mentions',
    expected: '<p>These # #<em>**</em> are not mentions</p>',
  },
  {
    input: 'These @* @*** are not mentions',
    expected: '<p>These @* @*** are not mentions</p>',
  },
  {
    input: 'These #* #*** are also not mentions',
    expected: '<p>These #* #*** are also not mentions</p>',
  },
  {
    input: 'This is a #**Denmark** stream link',
    expected:
      '<p>This is a <a class="stream" data-stream-id="1" href="http://localhost:9991/#narrow/stream/Denmark">#Denmark</a> stream link</p>',
  },
  {
    input: 'This is #**Denmark** and #**social** stream links',
    expected:
      '<p>This is <a class="stream" data-stream-id="1" href="http://localhost:9991/#narrow/stream/Denmark">#Denmark</a> and <a class="stream" data-stream-id="2" href="http://localhost:9991/#narrow/stream/social">#social</a> stream links</p>',
  },
  {
    input: 'And this is a #**wrong** stream link',
    expected: '<p>And this is a #**wrong** stream link</p>',
  },
  {
    input: 'mmm...:burrito:s',
    expected:
      '<p>mmm...<img alt=":burrito:" class="emoji" src="/static/generated/emoji/images/emoji/unicode/1f32f.png" title="burrito">s</p>',
  },
  {
    input: 'This is an :poop: message',
    expected:
      '<p>This is an <img alt=":poop:" class="emoji" src="/static/generated/emoji/images/emoji/unicode/1f4a9.png" title="poop"> message</p>',
  },
  {
    input: '\ud83d\udca9',
    expected:
      '<p><img alt=":poop:" class="emoji" src="/static/generated/emoji/images/emoji/unicode/1f4a9.png" title="poop"></p>',
  },
  {
    input: '\u{1f937}',
    expected: '<p>\u{1f937}</p>',
  },
  {
    input: 'This is a realm filter #1234 with text after it',
    expected:
      '<p>This is a realm filter <a href="https://trac.zulip.net/ticket/1234" target="_blank" title="https://trac.zulip.net/ticket/1234">#1234</a> with text after it</p>',
  },
  {
    input: 'This is a realm filter with ZGROUP_123:45 groups',
    expected:
      '<p>This is a realm filter with <a href="https://zone_45.zulip.net/ticket/123" target="_blank" title="https://zone_45.zulip.net/ticket/123">ZGROUP_123:45</a> groups</p>',
  },
  {
    input: 'This is an !avatar(cordelia@zulip.com) of Cordelia Lear',
    expected:
      '<p>This is an <img alt="cordelia@zulip.com" class="message_body_gravatar" src="/avatar/cordelia@zulip.com?s=30" title="cordelia@zulip.com"> of Cordelia Lear</p>',
  },
  {
    input: 'This is a !gravatar(cordelia@zulip.com) of Cordelia Lear',
    expected:
      '<p>This is a <img alt="cordelia@zulip.com" class="message_body_gravatar" src="/avatar/cordelia@zulip.com?s=30" title="cordelia@zulip.com"> of Cordelia Lear</p>',
  },
  {
    input: 'Test *italic*',
    expected: '<p>Test <em>italic</em></p>',
  },
  {
    input: 'T\n#**Denmark**',
    expected:
      '<p>T<br>\n<a class="stream" data-stream-id="1" href="http://localhost:9991/#narrow/stream/Denmark">#Denmark</a></p>',
  },
  {
    input: 'T\n@**Cordelia Lear**',
    expected: '<p>T<br>\n<span class="user-mention" data-user-id="101">@Cordelia Lear</span></p>',
  },
  {
    input: 'This is a realm filter `hello` with text after it',
    expected: '<p>This is a realm filter <code>hello</code> with text after it</p>',
  },
];

const users = [
  {
    fullName: 'Cordelia Lear',
    id: 101,
    email: 'cordelia@zulip.com',
  },
  {
    fullName: 'Leo',
    id: 102,
    email: 'leo@zulip.com',
  },
  {
    fullName: 'Iago',
    id: 103,
    email: 'iago@zulip.com',
  },
];
const streams = [
  {
    subscribed: false,
    color: 'blue',
    name: 'Denmark',
    stream_id: 1,
    in_home_view: false,
  },
  {
    subscribed: true,
    color: 'red',
    name: 'social',
    stream_id: 2,
    in_home_view: true,
    invite_only: true,
  },
];
const auth = {
  realm: 'http://localhost:9991',
  apiKey: 'AJHDFIAS8231827381',
  email: 'iago@zulip.com',
};
const realm_users = [];
const realm_emoji = {
  burrito: {
    display_url: '/static/generated/emoji/images/emoji/burrito.png',
    source_url: '/static/generated/emoji/images/emoji/burrito.png',
  },
};
const realm_filters = [
  ['#(?P<id>[0-9]{2,8})', 'https://trac.zulip.net/ticket/%(id)s'],
  ['ZBUG_(?P<id>[0-9]{2,8})', 'https://trac2.zulip.net/ticket/%(id)s'],
  [
    'ZGROUP_(?P<id>[0-9]{2,8}):(?P<zone>[0-9]{1,8})',
    'https://zone_%(zone)s.zulip.net/ticket/%(id)s',
  ],
];
describe('Preview test messages', () => {
  // const testCase = testCases[20];
  // test(`Test markdown ${testCase.input.replace('\n', '\\n')}`, () => {
  //   const parsedHTML = parseMarkdown(
  //     testCase.input,
  //     users,
  //     streams,
  //     auth,
  //     realm_users,
  //     realm_filters,
  //     realm_emoji,
  //   );
  //   expect(parsedHTML).toEqual(testCase.expected);
  // });
  let index = 0;
  testCases.forEach(testCase =>
    test(`Test index ${index++} markdown ${testCase.input.replace('\n', '\\n')}`, () => {
      const parsedHTML = parseMarkdown(
        testCase.input,
        users,
        streams,
        auth,
        realm_users,
        realm_filters,
        realm_emoji,
      );
      expect(parsedHTML).toEqual(testCase.expected);
    }),
  );
});
