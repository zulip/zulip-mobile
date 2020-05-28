import processAlertWords from '../processAlertWords';

const alertWords = ['alertone', 'alerttwo', 'alertthree', 'al*rt.*s', '.+', 'emoji'];

describe('processAlertWords', () => {
  test('if msg id is not in has_alert_word flags, return original content', () => {
    const flags = {
      has_alert_word: {},
    };
    expect(processAlertWords('some emoji text', 2, alertWords, flags)).toEqual('some emoji text');
  });

  test('if msg id is present in has_alert_word flags, process message content', () => {
    const flags = {
      has_alert_word: {
        2: true,
      },
    };
    expect(processAlertWords('<p>another alertone message</p>', 2, alertWords, flags)).toEqual(
      "<p>another <span class='alert-word'>alertone</span> message</p>",
    );
  });

  test('if msg contains multiple alert words, wrap all', () => {
    const flags = {
      has_alert_word: {
        2: true,
      },
    };
    expect(
      processAlertWords(
        '<p>another alertthreemessage alertone and then alerttwo</p>',
        2,
        alertWords,
        flags,
      ),
    ).toEqual(
      "<p>another alertthreemessage <span class='alert-word'>alertone</span> and then <span class='alert-word'>alerttwo</span></p>",
    );
  });

  test('miscellaneous tests', () => {
    const flags = {
      has_alert_word: {
        2: true,
      },
    };
    expect(processAlertWords('<p>gotta al*rt.*s all</p>', 2, alertWords, flags)).toEqual(
      "<p>gotta <span class='alert-word'>al*rt.*s</span> all</p>",
    );

    expect(
      processAlertWords('<p>http://www.google.com/alertone/me</p>', 2, alertWords, flags),
    ).toEqual('<p>http://www.google.com/alertone/me</p>');

    expect(processAlertWords('<p>still alertone? me</p>', 2, alertWords, flags)).toEqual(
      "<p>still <span class='alert-word'>alertone</span>? me</p>",
    );

    expect(
      processAlertWords(
        '<p>now with link <a href="http://www.alerttwo.us/foo/bar" target="_blank" title="http://www.alerttwo.us/foo/bar">www.alerttwo.us/foo/bar</a></p>',
        2,
        alertWords,
        flags,
      ),
    ).toEqual(
      '<p>now with link <a href="http://www.alerttwo.us/foo/bar" target="_blank" title="http://www.alerttwo.us/foo/bar">www.<span class=\'alert-word\'>alerttwo</span>.us/foo/bar</a></p>',
    );

    expect(
      processAlertWords(
        '<p>I <img alt=":heart:" class="emoji" src="/static/generated/emoji/images/emoji/unicode/2764.png" title="heart"> emoji!</p>',
        2,
        alertWords,
        flags,
      ),
    ).toEqual(
      '<p>I <img alt=":heart:" class="emoji" src="/static/generated/emoji/images/emoji/unicode/2764.png" title="heart"> <span class=\'alert-word\'>emoji</span>!</p>',
    );
  });
});
